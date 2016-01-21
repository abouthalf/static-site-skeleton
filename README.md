# Static Site Generator Gulp Recipe

Sure you could use a [pre-existing static site generator](https://www.staticgen.com), but face it:

* Only developers fuss with static web sites
* You’re a developer
* Static site just aren’t that complicated
* Gulp exists

So why not just make one? This way if you want to change your template engine, your content format, or add in any special features, you can just write a gulp task for it.

## About

This project takes advantage of:

* Gulp for build tasks
* Less for CSS
* Jade for templates
* Markdown for content (using marked via gulp-markdown)

As well as a few utilities for putting things together and developing:

* gulp-data
* frontMatter
* gulp-util
* through2
* gulp-webserver

# How it works

All site generation is bog-standard gulp tasks with a small custom plugin to wrap the page content in a Jade template and a small plugin to create archive pages and a home page of recent blog posts.

## Blogging

Place your blog posts in the “posts” directory. Each blog post is a markdown file (with a `.md` extension) with a front-matter block. All post meta-data is extracted from the front-matter, so feel free to name your files any way you wish and use sub-directories if you need. It is recommended to title your posts numerically or with a date and time for easy sorting. Be sure to include at least a `title` and a `published` date in each post. 

### Blog front-matter

Blogs support:

* title: *required* - page / post title
* published: *required* - publish date for the blog post. 
* description:  - page description for meta-tags 
* keywords: - keywords for meta-tags
* slug: An optional URL slug. If omitted a URL slug will be generated from the title

### Publish dates

The `published` date front-matter field should be a valid JavaScript date string with a timezone such as `Wed, 20 Jan, 2016 07:08 PST` or `2016-02-14T12:30Z-0800` or `January 20, 2016 7:16 AM PST`.

If you use an ISO-like string such as `2016-02-15`, without a time or a timezone Node will adjust this to UTC and your dates may appear incorrect. If using an ISO type string, include a timezone like `2016-02-15 PST`. 

When using a localized published date without a timezone, like `January 20, 2016 7:16 AM`, Node will use your system locale and timezone when interpreting the date. This may be fine if you only ever build your site on your personal machine or server - but could be a problem if building on a hosted platform. That is, your host may be in California while you are in New York and now your local NY publish dates are CA dates. Why not eliminate the hassle and include a time zone? [Google `current time` to get your current time with the time zone](https://www.google.com/#q=current+time).

## Pages

Pages are stored in the pages directory. By default a `home.md` page is included as a default home page should you choose not to have your blog on the home page.

Pages are also markdown (`.md`) formatted files (with an optional front-matter block). No front-matter is required for pages, but a `title` field is recommended. A navigation bar is automatically generated from the pages in this directory. If you wish to exclude a page from the navigation, add `nav: false` to the front-matter block