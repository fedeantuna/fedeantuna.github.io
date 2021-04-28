import Head from 'next/head';
import Link from 'next/link';
import Layout, { name } from '../components/Layout/Layout';
import Date from '../components/Date/Date';
import { getSortedArticleMetadata } from '../services/articleService';

const getStaticProps = async () => {
	const articleMetadata = getSortedArticleMetadata();

	return {
		props: {
			articleMetadata,
		},
	};
};

const Home = ({ articleMetadata }) => {
	const siteTitle = `Programming Blog - ${name}`;

	return (
		<Layout isHomePage>
			<Head>
				<title>{siteTitle}</title>
			</Head>
			<section className='text-center mt-5'>
				<p>
					Hello there! I'm Federico, but people call me "Fede". I'm a
					fullstack developer (stronger on backend). My main platforms
					are .NET and C# on the backend and React on the frontend.
				</p>
				<p>
					The idea of this blog is to share helpful and interesting
					things (or that at least I consider interesting) related to
					technology in general.
				</p>
			</section>
			<section className='mt-5'>
				<h2>Articles</h2>
				<ul className='list-none ml-0'>
					{articleMetadata.map(({ id, date, title }) => (
						<li className='mt-2' key={id}>
							<Link href={`/article/${id}`}>
								<a>{title}</a>
							</Link>
							<br />
							<small>
								<Date dateString={date} />
							</small>
						</li>
					))}
				</ul>
			</section>
		</Layout>
	);
};

export default Home;
export { getStaticProps };
