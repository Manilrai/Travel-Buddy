/**
 * Verification Controller
 * Handles KYC verification requests
 */

const { VerificationRequest, User, Profile, Notification } = require('../models');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Submit a verification request
 * @route   POST /api/verification/submit
 * @access  Private
 */
const submitVerification = asyncHandler(async (req, res) => {
    // Check for existing pending request
    const existing = await VerificationRequest.findOne({
        where: { userId: req.user.id, status: 'pending' }
    });

    if (existing) {
        throw new ApiError('You already have a pending verification request', 400);
    }

    if (!req.files || !req.files.idFront || !req.files.selfie) {
        throw new ApiError('Please upload both ID front and selfie photos', 400);
    }

    const { personalDetails, idDocType, idDocNumber } = req.body;

    // Parse personalDetails if sent as a JSON string
    let parsedDetails = personalDetails;
    if (typeof personalDetails === 'string') {
        try {
            parsedDetails = JSON.parse(personalDetails);
        } catch (e) {
            parsedDetails = {};
        }
    }

    const verification = await VerificationRequest.create({
        userId: req.user.id,
        personalDetails: parsedDetails || {},
        idDocType: idDocType || 'national_id',
        idDocNumber: idDocNumber || '',
        idFrontUrl: `/uploads/verification/${req.files.idFront[0].filename}`,
        selfieUrl: `/uploads/verification/${req.files.selfie[0].filename}`,
        status: 'pending'
    });

    res.status(201).json({
        success: true,
        message: 'Verification request submitted',
        data: verification
    });
});

/**
 * @desc    Get my verification status
 * @route   GET /api/verification/me
 * @access  Private
 */
const getMyVerification = asyncHandler(async (req, res) => {
    const verification = await VerificationRequest.findOne({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: verification
    });
});

/**
 * @desc    Get all verification requests (admin)
 * @route   GET /api/verification/admin
 * @access  Admin
 */
const getAllVerifications = asyncHandler(async (req, res) => {
    const { status = 'pending_review' } = req.query;
    const where = {};
    // Map frontend 'pending_review' to DB 'pending' status
    if (status !== 'all') {
        where.status = status === 'pending_review' ? 'pending' : status;
    }

    const verifications = await VerificationRequest.findAll({
        where,
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'email'],
            include: [{
                model: Profile,
                as: 'profile',
                attributes: ['fullName']
            }]
        }],
        order: [['createdAt', 'DESC']]
    });

    // Transform to ensure frontend gets the fields it expects
    const transformed = verifications.map(v => {
        const plain = v.toJSON();
        return {
            ...plain,
            personalDetails: plain.personalDetails || {
                fullName: plain.user?.profile?.fullName || plain.user?.email || 'Unknown',
                nationality: '',
                dob: '',
                phone: '',
                address: ''
            }
        };
    });

    res.json({
        success: true,
        data: transformed
    });
});

/**
 * @desc    Approve verification request (admin)
 * @route   POST /api/verification/admin/:id/approve
 * @access  Admin
 */
const approveVerification = asyncHandler(async (req, res) => {
    const verification = await VerificationRequest.findByPk(req.params.id);

    if (!verification) {
        throw new ApiError('Verification request not found', 404);
    }

    await verification.update({
        status: 'approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
    });

    // Update user verified status
    await User.update(
        { isVerified: true },
        { where: { id: verification.userId } }
    );

    // Send notification
    await Notification.create({
        userId: verification.userId,
        type: 'verification',
        title: 'Verification Approved',
        message: 'Your identity has been verified! You can now book services.',
        link: '/profile'
    });

    res.json({
        success: true,
        message: 'Verification approved'
    });
});

/**
 * @desc    Reject verification request (admin)
 * @route   POST /api/verification/admin/:id/reject
 * @access  Admin
 */
const rejectVerification = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const verification = await VerificationRequest.findByPk(req.params.id);

    if (!verification) {
        throw new ApiError('Verification request not found', 404);
    }

    await verification.update({
        status: 'rejected',
        reviewedBy: req.user.id,
        rejectionReason: reason || 'Verification rejected',
        reviewedAt: new Date()
    });

    // Send notification
    await Notification.create({
        userId: verification.userId,
        type: 'verification',
        title: 'Verification Rejected',
        message: reason || 'Your verification was rejected. Please try again with clearer photos.',
        link: '/profile'
    });

    res.json({
        success: true,
        message: 'Verification rejected'
    });
});

module.exports = {
    submitVerification,
    getMyVerification,
    getAllVerifications,
    approveVerification,
    rejectVerification
};
