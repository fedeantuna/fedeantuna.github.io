import Head from 'next/head';
import Link from 'next/link';
import Header from '../Header/Header';

const name = 'Federico Antuña';
const title = 'Software Developer';

const Layout = ({ children, isHomePage }) => {
	return (
		<>
			<Head>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='container sm:m-auto'>
				<Header name={name} title={title} isHomePage={isHomePage} />
				<main className='mr-3 ml-3 lg:mr-0 lg:ml-0'>{children}</main>
				{!isHomePage && (
					<div className='mb-5'>
						<Link href='/'>
							<a>← Back to home</a>
						</Link>
					</div>
				)}
			</div>
		</>
	);
};

export default Layout;
export { name };
