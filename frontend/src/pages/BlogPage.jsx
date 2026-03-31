import { Link } from 'react-router-dom';
import { blogs } from '../data/blogData';
import { FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';

const BlogPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container-custom">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        Stories & Guides
                    </h1>
                    <p className="text-lg text-gray-600">
                        Discover breathtaking destinations, local culture, and essential travel tips from our community of adventurers in Nepal.
                    </p>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog) => (
                        <article 
                            key={blog.id} 
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
                        >
                            <Link to={`/blog/${blog.id}`} className="relative h-64 overflow-hidden block">
                                <img 
                                    src={blog.image} 
                                    alt={blog.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary-700 shadow-sm">
                                    {blog.category}
                                </div>
                            </Link>
                            
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1.5">
                                        <FiCalendar className="w-4 h-4" />
                                        {blog.date}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <FiClock className="w-4 h-4" />
                                        {blog.readTime}
                                    </span>
                                </div>
                                
                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                                    <Link to={`/blog/${blog.id}`}>
                                        {blog.title}
                                    </Link>
                                </h2>
                                
                                <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                                    {blog.excerpt}
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <img 
                                            src={blog.author.avatar} 
                                            alt={blog.author.name}
                                            className="w-8 h-8 rounded-full bg-gray-100"
                                        />
                                        <span className="text-sm font-medium text-gray-900">{blog.author.name}</span>
                                    </div>
                                    
                                    <Link 
                                        to={`/blog/${blog.id}`}
                                        className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-700 group/btn"
                                    >
                                        Read More
                                        <FiArrowRight className="w-4 h-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
