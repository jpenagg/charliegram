import Link from 'next/link'
import React from 'react'

const Nav = () => {
 return (
    <nav className="flex items-center justify-between flex-wrap p-8">
      <div className="flex items-center flex-shrink-0 text-white/80 mr-6">
        <a target="_blank" rel="noreferrer" className="font-mono text-3xl tracking-wide font-semibold hover:text-white cursor-pointer">CHARLIEGRAM</a>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          <Link href="/" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
            Home
          </Link>
          <Link href="/about" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
            About
          </Link>
          <Link href="/milestones" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
            Milestones
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Nav