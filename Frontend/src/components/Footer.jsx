import React from 'react';
import { Link } from 'react-router-dom';
import { LinkedIn, GitHub, Twitter, Instagram } from '@mui/icons-material';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="mx-auto md:flex md:justify-between lg:w-5/6 p-5">
                <div>
                    <h1 className='font-bold pb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-3xl w-fit'>
                        <Link to={"/"}>Live Meeting</Link>
                    </h1>
                    <p>&copy;{` ${new Date().getFullYear()} Live Meeting. All rights reserved.`}</p>
                </div>

                <div className="mt-4 flex gap-8">
                    {
                        [
                            { link: "https://in.linkedin.com/in/nitin-gayke92", Icon: LinkedIn, name: "LinkedIn" }, 
                            { link: "https://github.com/nitingayke", Icon: GitHub, name: "GitHub"  }, 
                            { link: "https://x.com/NitinGayke9209", Icon: Twitter, name: "Twitter"  }, 
                            { link: "https://www.instagram.com/gaykenitin975/", Icon: Instagram, name: "Instagram"  }
                        ].map((ele, idx) => (
                            <Link to={ele.link} key={idx} target="_blank" rel="noopener noreferrer" className='text-center'>
                                <ele.Icon className="text-white hover:text-gray-400" style={{fontSize: "2.2rem"}} />
                                <p className='text-sm pt-2 text-gray-500'>{ele.name}</p>
                            </Link>
                        ))
                    }
                </div>
            </div>
        </footer>
    );
}
