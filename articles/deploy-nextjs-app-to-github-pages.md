---
title: 'Deploy NEXT.JS App to GitHub Pages'
date: '2021-04-29'
---

These last couple of days I've been wanting to create a simple and straight forward blog, to just keep the articles that I write and present myself. So I decided to do that using GitHub Pages and a simple NEXT.JS application, very similar to the one shown in the [official tutorial](https://nextjs.org/learn/basics/create-nextjs-app). ~~It suprised me how little and misleading information I found on how to do that, so I'm writing this.~~ While making this guide I found a video that explains a similar approach to what I did and it's worth taking a look at it! [You can check it out here](https://www.youtube.com/watch?v=yRz8D_oJMWQ). It would have save me some effort finding this earlier.

## Conditions

Before we start, there are cases where this is not going to be possible so I want to save you the trouble of going through all of this just to get a disgusting suprise at the end.

We are going to depend on the output of `next export`, so it is important that the application that you want to deploy is able to use it.

> -   With `next export`, we build an HTML version of your app. At export time, we call `getStaticProps` for each page that exports it, and pass the result to the page's component. It's also possible to use the older `getInitialProps` API instead of `getStaticProps`, but it comes with a few caveats:
>
>     -   `getInitialProps` cannot be used alongside `getStaticProps` or `getStaticPaths` on any given page. If you have dynamic routes, instead of using `getStaticPaths` you'll need to configure the `exportPathMap` parameter in your `next.config.js` file to let the exporter know which HTML files it should output.
>     -   When `getInitialProps` is called during export, the `req` and `res` fields of its `context` parameter will be empty objects, since during export there is no server running.
>     -   `getInitialProps` **will be called on every client-side navigation**, if you'd like to only fetch data at build-time, switch to `getStaticProps`.
>     -   `getInitialProps` should fetch from an API and cannot use Node.js-specific libraries or the file system like `getStaticProps` can.
>
> -   It's recommended to use and migrate towards `getStaticProps` over `getInitialProps` whenever possible.
> -   The `fallback: true` mode of `getStaticPaths` is not supported when using `next export`.
> -   API Routes are not supported by this method because they can't be prerendered to HTML.
> -   `getServerSideProps` cannot be used within pages because the method requires a server. Consider using `getStaticProps` instead.
> -   Internationalized Routing is not supported as it requires Next.js' server-side routing.
> -   The `next/image` component's default loader is not supported when using `next export`. However, other loader options will work.

You can read [here](https://nextjs.org/docs/advanced-features/static-html-export) for more information.

I will assume that you already have a NEXT.JS app. In order to test if your app will work, go to the `package.json` and add an `export` script to the `scripts` section. It should look something like this:

```
...
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next export",
    "start": "next start"
},
...
```

And now if you run `npm run build && npm run export` without problems, then your app is ready.

## GitHub Repository

We can use an existent repository for a project site or we can create one for our user or organization site. You can read [here](https://pages.github.com/) for more information. The first one is a bit more complicated, but we will address the issues that might present later.

I will also assume that the source code for the NEXT.JS app is on the root (/) directory of the `main` branch. If that is not the case for you, you will have to make some changes to the things we do to follow along.

Let's create an orphan branch called `gh-pages` on our local repository and make sure that the staging area is empty. Then create an empty commit and push the branch to GitHub.

```
git checkout --orphan gh-pages
git reset
git commit --allow-empty -m "Initial commit"
git push --set-upstream origin gh-pages
```

Now we go to the _Settings_ tab of our repository on GitHub, to the _Pages_ section and select the branch `gh-pages` and the _/ (root)_ directory, then we click _Save_.

We could just push the result of the `export` to `gh-pages` manually every time we want to update the page. That will work, but it's too much work for every change we want to make and it requires a lot of manual intervention, so we also want this to be automated as much as possible.

## GitHub Actions

Let's create a GitHub Action so every time we push our changes to `main`, we automatically deploy our app. You can read [here](https://docs.github.com/en/actions/reference/events-that-trigger-workflows) if you want to use a different trigger.

We will use the _Node.js_ template, you can find the updated one [here](https://docs.github.com/en/actions/guides/building-and-testing-nodejs). Create a file called _gh-pages.deploy.yml_ (you can actually name it whatever you want) under the _.github/workflows_ directory.

In that file we will modify the _Node.js_ template to suit our needs into something like this.

```
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x]

    steps:
      - name: Get files
        uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install packages
        run: npm ci
      - name: Build project
        run: npm run build
      - name: Export static files
        run: npm run export
      - name: Add .nojekyll file
        run: touch ./out/.nojekyll
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.1
        with:
          branch: gh-pages
          folder: out
```

This file is a set of instructions for GitHub to run our tasks. Let's review it by parts.

The first `name` is just to indicate the name of the workflow, you can change it to whatever you want.

The `on` will specify when this workflow should be run. Here we are saying whenever we push to the main branch. You can modify this as needed by changing the branch name or even the trigger action, maybe you want this to be updated on PRs as well like it is on the template.

Then we have `jobs`. This section will define the jobs that we want to run on the workflow, here we have just the `build`. Inside it we also specify the OS in which it will be ran, the Node versions and the steps. Unless you really need to change the OS, leave it on `ubuntu-latest`, you can read more about that [here](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners). I selected only the 14.x version of Node because that is what works better for me, but if your project needs a different version, then you can change it.

The steps that we will use are quiet simple. On the first step, the checkout step, we get our code. The second step will setup NodeJS. The third one will install the packages with _npm_. The fourth one will build our project. The fifth will export the static files for _NEXT.JS_. The sixth step will create a _.nojekyll_ file inside the directory with the exported files. The last step is extracted from [here](https://github.com/marketplace/actions/deploy-to-github-pages). It will create a branch, `gh-pages` in our case, with the content of the _out_ directory. You can modify that if you need to. The `name` tag is optional, but I think it is nicer to look at than just the plain command.

IMPORTANT: keep the indentation of the YAML file, it relies on it (kind of like Python).

You might be wondering what is the empty _.nojekyll_ file that we created. Well, GitHub Pages works with the Jekyll engine (more information [here](https://jekyllrb.com/docs/)), so there are some directories that will be skipped automatically. Anything that starts with underscore or dot, won't be accessible. Since we need access to \__next_ directory, then we need to bypass Jekyll and the way to do that is by adding that _.nojekyll_ file.

Now we can push our content to the repository and if we check the _Actions_ tab on GitHub, we will see that our workflow is running. Once it's finished, if we go to the GitHub Pages URL (it will be https://YOUR_USERNAME.github.io or https://YOUR_USERNAME.github.io/YOUR_REPOSITORY) we will see our page. If it's a user site, then that's it! We should be able to navigate everything correctly. If it's a project site you might be seeing some issues with the images and static resources. We will fix that next.

## Fixing the issues

For project sites these are the problems we will see:

-   Images are not loading
-   Navigation is not working

To put it short, the reason why this is happening is because NEXT.JS expects to be under https://YOUR_USERNAME.github.io/ while we are under https://YOUR_USERNAME.github.io/YOUR_REPOSITORY. You can read more about this [here](https://nextjs.org/docs/basic-features/static-file-serving), [here](https://nextjs.org/docs/api-reference/next.config.js/cdn-support-with-asset-prefix) and [here](https://nextjs.org/docs/api-reference/next.config.js/basepath).

To fix this we will make use of environment variables. On the example we can see on the NEXT.JS documentation, on the _CDN Supoport with Asset Prefix_ section, it's using the _NODE_ENV_ variable to check if we are on production. We could use something like that but in our case I prefer using the _NEXT_PUBLIC_BASE_PATH_ variable.

We have to first create a file on the root of our app called `next.config.js` and put this content inside:

```
module.exports {
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH
}
```

Then on the YAML file (the one we named `gh-pages.deploy.yml` earlier), we have to add that variable and initialize it with our repository name.

```
...
jobs:
  build:
    runs-on: ubuntu-latest

    env:
      NEXT_PUBLIC_BASE_PATH: /YOUR_REPOSITORY

    strategy:
      matrix:
        node-version: [14.x]
...
```

Make sure to replace _YOUR_REPOSITORY_ by your actual repository name.

Now we are only left to fix the images, since they are being loaded from the _public_ directory, our prefixes don't have any effect there. In order to fix that we will go to the files where we can create a `prefix.js` file and add the following:

```
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';

export { prefix };
```

Then we just need to import `prefix` where we are using references to the images and prepend that to the `src` attribute.

```
...
import { prefix } from '../../utils/prefix.js';
...
    <img src={`${prefix}/someimage.jpg`} alt='some alt text' />
...
```

Commit and push, and once the action is finished you will be able to see the images and navigate your app!

## Thanks!

Thanks for reading this article! I hope this was helpful and as fun to read as it was to write!
