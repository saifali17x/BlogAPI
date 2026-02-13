import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to BlogAPI</h1>
          <p className="text-lg mb-8">
            Share your thoughts and read amazing stories
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/posts"
              className="px-6 py-2 bg-white text-blue-600 rounded"
            >
              Explore Posts
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-blue-700 text-white rounded"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold mb-2">Write & Publish</h3>
            <p className="text-gray-600 text-sm">
              Create and share your stories
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold mb-2">Engage</h3>
            <p className="text-gray-600 text-sm">Comment and discuss</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🏷️</div>
            <h3 className="font-semibold mb-2">Organize</h3>
            <p className="text-gray-600 text-sm">Tags and categories</p>
          </div>
        </div>
      </div>
    </div>
  );
}
