import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import Date from '../../components/Date/Date';
import { getArticle, getArticleIds } from '../../services/articleService';

const getStaticProps = async ({ params }) => {
	const article = await getArticle(params.id);
	return {
		props: {
			article,
		},
	};
};

const getStaticPaths = async () => {
	const paths = getArticleIds();
	return {
		paths,
		fallback: false,
	};
};

const Article = ({ article }) => {
	return (
		<Layout>
			<Head>
				<title>{article.title}</title>
				<base target='_blank'></base>
			</Head>
			<article>
				<h1 className='text-center text-2xl mt-5'>{article.title}</h1>
				<div className='text-center text-sm'>
					<Date dateString={article.date} />
				</div>
				<div
					className='mt-2 mb-5'
					dangerouslySetInnerHTML={{ __html: article.contentHtml }}
				/>
			</article>
		</Layout>
	);
};

export default Article;
export { getStaticPaths, getStaticProps };
