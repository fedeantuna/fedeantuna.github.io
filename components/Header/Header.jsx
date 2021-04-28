import Link from 'next/link';
import SocialBar from '../SocialBar/SocialBar';

const Header = ({ name, title, isHomePage }) => {
	return (
		<header>
			{isHomePage ? (
				<div className='flex space-x-5 justify-center mt-5'>
					<div className='w-32 h-32'>
						<img
							className='m-0 rounded-full border border-gray-100 shadow-sm'
							src='/images/profile.png'
							alt={name}
						/>
					</div>
					<div className='self-center'>
						<h1 className='m-0 text-2xl'>{name}</h1>
						<h2 className='m-0'>{title}</h2>
						<SocialBar
							linkedin='https://linkedin.com/in/federicoantuna/'
							github='https://github.com/fedeantuna'
						/>
					</div>
				</div>
			) : (
				<div className='flex space-x-5 justify-end mt-5 mr-2 lg:mr-0'>
					<Link href='/'>
						<a className='w-16 h-16'>
							<img
								className='m-0 rounded-full border border-gray-100 shadow-sm'
								src='/images/profile.png'
								alt={name}
							/>
						</a>
					</Link>
					<div className='self-center'>
						<h2 className='m-0'>
							<Link href='/'>
								<a>{name}</a>
							</Link>
						</h2>
						<h2 className='m-0 text-sm'>{title}</h2>
						<SocialBar
							small
							linkedin='https://www.linkedin.com/in/federicoantuna/'
							github='https://github.com/fedeantuna'
						/>
					</div>
				</div>
			)}
		</header>
	);
};

export default Header;
