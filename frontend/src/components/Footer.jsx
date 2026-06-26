import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center text-white font-bold text-xs">B</div>
              <span className="font-bold text-white text-sm">Blogify</span>
            </div>
            <p className="text-xs leading-relaxed">
              A place to share ideas, discover stories, and connect with thinkers from around the world.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/posts" className="hover:text-white transition-colors">All Posts</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Start Writing</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white transition-colors cursor-pointer">Open Source</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Built with React & Node.js</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Powered by PostgreSQL</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p>© {new Date().getFullYear()} Blogify. All rights reserved.</p>
          <p>Built with React, Tailwind CSS &amp; Express</p>
        </div>
      </div>
    </footer>
  );
}
