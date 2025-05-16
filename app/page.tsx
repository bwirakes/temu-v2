import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
      <header className="mb-16">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="flex">
              <span className="h-8 w-8 bg-temu-logo-red rounded-full"></span>
              <span className="h-8 w-8 bg-temu-logo-green rounded-full -ml-2"></span>
              <span className="h-8 w-8 bg-temu-logo-yellow rounded-full -ml-2"></span>
              <span className="h-8 w-8 bg-temu-logo-blue rounded-full -ml-2"></span>
            </div>
            <h1 className="text-2xl font-bold ml-2">TEMU</h1>
          </div>
          <nav>
            <ul className="flex gap-4">
              <li><Link href="#" className="nav-link">Home</Link></li>
              <li><Link href="#" className="nav-link">Jobs</Link></li>
              <li><Link href="#" className="nav-link">About</Link></li>
              <li><Link href="#" className="nav-link">Contact</Link></li>
            </ul>
          </nav>
          <div className="flex gap-4">
            <button className="btn-outline">Sign In</button>
            <button className="btn-filled">Sign Up</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-hero-medium md:text-hero-large mb-6">Talent Empowerment Platform</h1>
            <p className="text-xl mb-8">Connecting talented individuals with opportunities that matter.</p>
            <div className="flex gap-4">
              <button className="btn-filled">Find Jobs</button>
              <button className="btn-outline">For Employers</button>
            </div>
          </div>
          <div className="bg-temu-medium-blue rounded-4xl p-8 aspect-square flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold mb-4">Ready to get started?</p>
              <p className="mb-6">Create your profile and start your journey today.</p>
              <button className="btn-filled">Create Profile</button>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-16">
        <h2 className="text-3xl mb-8">Style Showcase</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Typography */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="mb-4">Typography</h3>
            <h1 className="text-3xl mb-2">Heading 1</h1>
            <h2 className="text-2xl mb-2">Heading 2</h2>
            <h3 className="text-xl mb-2">Heading 3</h3>
            <h4 className="text-lg mb-2">Heading 4</h4>
            <h5 className="text-base mb-2">Heading 5</h5>
            <p className="mb-2">Regular paragraph text</p>
            <p className="text-sm">Small text</p>
          </div>
          
          {/* Buttons */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="mb-4">Buttons</h3>
            <div className="flex flex-col gap-4">
              <button className="btn-filled">Primary Button</button>
              <button className="btn-outline">Secondary Button</button>
              <button className="btn-filled bg-temu-logo-red border-temu-logo-red">Red Button</button>
              <button className="btn-outline border-temu-logo-blue text-temu-logo-blue hover:bg-temu-logo-blue hover:text-white">Blue Outline</button>
            </div>
          </div>
          
          {/* Form Elements */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="mb-4">Form Elements</h3>
            <div className="mb-4">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" id="name" className="form-field" placeholder="Enter your name" />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" id="email" className="form-field" placeholder="Enter your email" />
            </div>
            <div>
              <label htmlFor="message" className="form-label">Message</label>
              <textarea id="message" rows={3} className="form-field" placeholder="Your message"></textarea>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl mb-8">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="aspect-square bg-temu-black rounded-lg flex items-end p-3">
            <span className="text-white text-sm">Black</span>
          </div>
          <div className="aspect-square bg-temu-light-blue rounded-lg flex items-end p-3">
            <span className="text-black text-sm">Light Blue</span>
          </div>
          <div className="aspect-square bg-temu-medium-blue rounded-lg flex items-end p-3">
            <span className="text-black text-sm">Medium Blue</span>
          </div>
          <div className="aspect-square bg-temu-form-green rounded-lg flex items-end p-3">
            <span className="text-black text-sm">Form Green</span>
          </div>
          <div className="aspect-square bg-temu-form-yellow rounded-lg flex items-end p-3">
            <span className="text-black text-sm">Form Yellow</span>
          </div>
          <div className="aspect-square bg-temu-form-pink rounded-lg flex items-end p-3">
            <span className="text-black text-sm">Form Pink</span>
          </div>
          <div className="aspect-square bg-temu-logo-red rounded-lg flex items-end p-3">
            <span className="text-white text-sm">Logo Red</span>
          </div>
          <div className="aspect-square bg-temu-logo-green rounded-lg flex items-end p-3">
            <span className="text-white text-sm">Logo Green</span>
          </div>
          <div className="aspect-square bg-temu-logo-yellow rounded-lg flex items-end p-3">
            <span className="text-black text-sm">Logo Yellow</span>
          </div>
          <div className="aspect-square bg-temu-logo-blue rounded-lg flex items-end p-3">
            <span className="text-white text-sm">Logo Blue</span>
          </div>
        </div>
      </section>

      <footer className="border-t pt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="mb-4">TEMU</h5>
            <p className="text-sm text-gray-600 mb-4">Talent Empowerment Platform connecting talented individuals with opportunities that matter.</p>
          </div>
          <div>
            <h5 className="mb-4">For Job Seekers</h5>
            <ul className="text-sm space-y-2">
              <li><Link href="#" className="hover:underline">Browse Jobs</Link></li>
              <li><Link href="#" className="hover:underline">Create Profile</Link></li>
              <li><Link href="#" className="hover:underline">CV Builder</Link></li>
              <li><Link href="#" className="hover:underline">Job Alerts</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4">For Employers</h5>
            <ul className="text-sm space-y-2">
              <li><Link href="#" className="hover:underline">Post a Job</Link></li>
              <li><Link href="#" className="hover:underline">Browse Candidates</Link></li>
              <li><Link href="#" className="hover:underline">Pricing</Link></li>
              <li><Link href="#" className="hover:underline">Enterprise Solutions</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4">Contact</h5>
            <ul className="text-sm space-y-2">
              <li>Email: info@temu.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Tech Street, San Francisco, CA 94107</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} TEMU. All rights reserved.</p>
      </div>
      </footer>
    </div>
  );
} 