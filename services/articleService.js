import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import remark from 'remark';
import html from 'remark-html';

const articlesDirectory = path.join(process.cwd(), 'articles');

const getSortedArticleMetadata = () => {
	const fileNames = fs.readdirSync(articlesDirectory);

	const articleMetadata = fileNames.map((fileName) => {
		const id = fileName.replace(/\.md$/, '');

		const fullPath = path.join(articlesDirectory, fileName);
		const fileContent = fs.readFileSync(fullPath, 'utf8');

		const metadata = matter(fileContent);

		return {
			id,
			...metadata.data,
		};
	});

	// Sort posts by date
	return articleMetadata.sort((a, b) => {
		if (a.date < b.date) {
			return 1;
		} else {
			return -1;
		}
	});
};

const getArticleIds = () => {
	const fileNames = fs.readdirSync(articlesDirectory);

	return fileNames.map((fileName) => {
		return {
			params: {
				id: fileName.replace(/\.md$/, ''),
			},
		};
	});
};

const getArticle = async (id) => {
	const fullPath = path.join(articlesDirectory, `${id}.md`);
	const fileContent = fs.readFileSync(fullPath, 'utf8');

	const metadata = matter(fileContent);

	const processedContent = await remark().use(html).process(metadata.content);
	const contentHtml = processedContent.toString();

	return {
		id,
		contentHtml,
		...metadata.data,
	};
};

export { getSortedArticleMetadata, getArticleIds, getArticle };
