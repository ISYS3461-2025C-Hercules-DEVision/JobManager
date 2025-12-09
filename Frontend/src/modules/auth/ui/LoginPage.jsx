import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

function LoginPage() {
  const { formData, loading, error, handleChange, handleSubmit } = useLogin();

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black p-10 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black text-center text-black mb-8 uppercase">Welcome back!</h1>
        
        {error && (
          <div className="mb-4 p-4 border-4 border-primary bg-primary/10 text-black font-bold">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold"
              required
              disabled={loading}
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-primary font-bold"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 border-4 border-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>

        <div className="my-6 text-center">
          <Link to="/forgot-password" className="text-black font-bold uppercase text-sm hover:underline underline-offset-4 decoration-4">
            Forgot your password?
          </Link>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-4 border-black"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-black font-black uppercase">OR</span>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-3 border-4 border-black hover:bg-black hover:text-white text-black font-bold py-4 uppercase transition-none">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Login with Google
        </button>

        <p className="text-center mt-6 text-black font-bold uppercase text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-black underline underline-offset-4 decoration-4">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
