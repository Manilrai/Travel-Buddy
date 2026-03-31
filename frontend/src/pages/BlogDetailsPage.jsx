import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogs } from '../data/blogData';
import { FiCalendar, FiClock, FiArrowLeft } from 'react-icons/fi';
import { useEffect } from 'react';

const BlogDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Find the blog from the mock data
    const blog = blogs.find(b => b.id === id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!blog) {
        return (
            <div className="container-custom py-24 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h2>
                <p className="text-gray-600 mb-8">The article you are looking for doesn't exist or has been removed.</p>
                <button 
                    onClick={() => navigate('/blog')}
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Back to Blog
                </button>
            </div>
        );
    }

    return (
        <article className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Section with Image */}
            <div className="w-full h-[60vh] min-h-[400px] relative">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-full object-cover absolute inset-0"
                />
                
                <div className="absolute inset-x-0 bottom-0 z-20 pb-16 pt-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <div className="container-custom max-w-4xl mx-auto">
                        <Link 
                            to="/blog"
                            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
                        >
                            <FiArrowLeft className="w-5 h-5 mr-2" />
                            Back to all articles
                        </Link>
                        
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                                {blog.category}
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            {blog.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center text-white/90 gap-6 text-sm md:text-base">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={blog.author.avatar} 
                                    alt={blog.author.name}
                                    className="w-10 h-10 rounded-full border-2 border-white/20"
                                />
                                <span className="font-medium">{blog.author.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <FiCalendar className="w-5 h-5 opacity-70" />
                                <span>{blog.date}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <FiClock className="w-5 h-5 opacity-70" />
                                <span>{blog.readTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container-custom max-w-3xl mx-auto mt-[-2rem] relative z-30">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-gray-100">
                    <div 
                        className="prose prose-lg md:prose-xl max-w-none text-gray-700
                                 prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-6 prose-headings:mt-10
                                 prose-h3:text-2xl
                                 prose-p:leading-relaxed prose-p:mb-6
                                 prose-li:my-2 prose-ul:mb-6 prose-ul:list-disc prose-ul:pl-6
                                 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                                 selection:bg-primary-100 selection:text-primary-900"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>
                
                {/* Author Bio Card at the bottom */}
                <div className="bg-white rounded-2xl p-8 flex items-center gap-6 border border-gray-100 shadow-sm">
                    <img 
                        src={blog.author.avatar} 
                        alt={blog.author.name}
                        className="w-20 h-20 rounded-full"
                    />
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Written by {blog.author.name}</h4>
                        <p className="text-gray-600">Travel enthusiast and storyteller sharing adventures from Nepal and beyond.</p>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default BlogDetailsPage;
