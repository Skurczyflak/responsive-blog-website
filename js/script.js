'use strict';

const templates = {
  articleLink: Handlebars.compile(document.querySelector('#template-article-link').innerHTML),
  tagLink: Handlebars.compile(document.querySelector('#template-tag-link').innerHTML),
  authorLink: Handlebars.compile(document.querySelector('#template-author-link').innerHTML),
  tagCloudLink: Handlebars.compile(document.querySelector('#template-tag-cloud-link').innerHTML),
  authorListLink: Handlebars.compile(document.querySelector('#template-author-list-link').innerHTML)
};

const opt = {
  ArticleSelector : '.post',
  TitleSelector : '.post-title',
  TitleListSelector : '.titles',
  ArticleTagsSelector : '.post-tags .list',
  ArticleTagsLinksSelector : '.list a[href^="#tag-"]',
  ArticleAuthorSelector : '.post .post-author',
  ArticleAuthorLinksSelector : 'a[href^="#author-"]',
  TagsListSelector : '.tags.list',
  CloudClassCount : 5,
  CloudClassPrefix : 'tag-size-',
  AuthorListSelector : '.list.authors'
};

//List of links

const titleClickHandler = function(event){
  event.preventDefault();
  const activeLinks = document.querySelectorAll('.titles a.active');

  for(let activeLink of activeLinks){
    activeLink.classList.remove('active');
  }

  const clickedElement = this;
  clickedElement.classList.add('active');
  const activeArticles = document.querySelectorAll('.post.active');

  for(let activeArticle of activeArticles){
      activeArticle.classList.remove('active');
  }

  const href = clickedElement.getAttribute('href');
  const targetArticle = document.querySelector(href);
  targetArticle.classList.add('active');

}

//Function GenerateTitleLinks

const generateTitleLinks = function(customSelector = ''){
  let html = '';
  const linkSelector = document.querySelector(opt.TitleListSelector);
  linkSelector.innerHTML = "";
  const articlesSelector = document.querySelectorAll(opt.ArticleSelector + customSelector);

  for(let Article of articlesSelector){
      const idArticle = Article.getAttribute('id');
      const titleArticle = Article.querySelector(opt.TitleSelector).innerHTML;
      const linkHTMLData = {id: idArticle, title: titleArticle};
      const linkArticle = templates.articleLink(linkHTMLData);
      html += linkArticle;
  }

  linkSelector.innerHTML += html;
  const links = document.querySelectorAll('.titles a');

  for(let link of links){
    link.addEventListener('click', titleClickHandler);
  }
}

generateTitleLinks();

function calculateTagsParams(tags){
  const minMax = {
    max: 0,
    min: 0
  };
  let toArray = Object.values(tags);
  minMax.min = Math.min(...toArray);
  minMax.max = Math.max(...toArray);
  return minMax;
}

function calculateTagClass(count, params){
  const normalizedCount = count - params.min;
  const normalizedMax = params.max - params.min;
  const percentage = normalizedCount / normalizedMax;
  const classNumber = Math.floor( percentage * (opt.CloudClassCount - 1) + 1 );
  return opt.CloudClassPrefix + classNumber;
}

function generateTags (){
  let allTags = {};
  const articlesSelector = document.querySelectorAll(opt.ArticleSelector);

  for(let article of articlesSelector){

    const tagSelector = article.querySelector(opt.ArticleTagsSelector);
    let html = '';
    const articleTags = article.getAttribute('data-tags');
    const articleTagsArray = articleTags.split(' ');

    for(let tag of articleTagsArray){
      const linkHTMLData = {id: tag, title: tag};
      const linkTag = templates.tagLink(linkHTMLData);
      html += linkTag;

      if(!allTags[tag]){
        allTags[tag] = 1;
      } else {
        allTags[tag]++;
      }
    }

    tagSelector.innerHTML = html;
    const tagList = document.querySelector(opt.TagsListSelector);
    const allTagsData = {tags: []};
    const tagsParams = calculateTagsParams(allTags);

    for(let tag in allTags){

    allTagsData.tags.push({
      tag: tag,
      count: allTags[tag],
      className: calculateTagClass(allTags[tag], tagsParams)
    });

    }
    /* [NEW] END LOOP: for each tag in allTags: */

    /*[NEW] add HTML from allTagsHTML to tagList */
    tagList.innerHTML = templates.tagCloudLink(allTagsData);
    }
}

generateTags();

function tagClickHandler(event){
  event.preventDefault();
  const clickedElement = this;
  const href = clickedElement.getAttribute('href');
  const tag = href.replace('#tag-','');
  const activeTags =  document.querySelectorAll('a.active[href^="#tag-"]');
  
  for(let activeTag of activeTags){
    activeTag.classList.remove('active');
  }
  const taglinks =  document.querySelectorAll('a[href="' + href + '"]');
  
  for(let link of taglinks){
    link.classList.add('active');
  }
  generateTitleLinks('[data-tags~="' + tag + '"]');
}

function addClickListenersToTags(){
  const tags = document.querySelectorAll(opt.ArticleTagsLinksSelector);
  for(let tag of tags){
    tag.addEventListener('click', tagClickHandler);
  }
}

addClickListenersToTags();


function generateAuthors (){
  let allAuthors = {};
  const articlesSelector = document.querySelectorAll(opt.ArticleSelector);
  for(let article of articlesSelector){
    const authorSelector = article.querySelector(opt.ArticleAuthorSelector);
    let html = '';
    const articleAuthors = article.getAttribute('data-author');
    const author = articleAuthors.split("-");
    const authorFullName = author[0] + ' ' + author[1];
    const linkHTMLData = {id: articleAuthors, title: authorFullName};
    const linkAuthor = templates.authorLink(linkHTMLData);
    html += linkAuthor;
    authorSelector.innerHTML = html;

    if(!allAuthors[articleAuthors]) {
      allAuthors[articleAuthors] = 1;
    }else {
      allAuthors[articleAuthors]++;
    }
    const authorList = document.querySelector(opt.AuthorListSelector);
    const allAuthorsData = {writer: []};

    for(let authors in allAuthors){
      const author = authors.split("-");
      const authorFullName = author[0] + ' ' + author[1];
      allAuthorsData.writer.push({
        id: authors,
        count: allAuthors[authors],
        fullName: authorFullName

      });
    }

    authorList.innerHTML = templates.authorListLink(allAuthorsData);

}
}
generateAuthors ();

function authorClickHandler(event){
  event.preventDefault();
  const clickedElement = this;
  const href = clickedElement.getAttribute('href');
  const author = href.replace('#author-','');
  const activeAuthors =  document.querySelectorAll('a.active[href^="#author-"]');
  for(let activeAuthor of activeAuthors){
    activeAuthor.classList.remove('active');
  }
  const authorlinks =  document.querySelectorAll('a[href="' + href + '"]');
  for(let link of authorlinks){
    link.classList.add('active');
  }
  generateTitleLinks('[data-author="' + author + '"]');
}

function addClickListenersToAuthors(){
  const tags = document.querySelectorAll(opt.ArticleAuthorLinksSelector);
  for(let tag of tags){
    tag.addEventListener('click', authorClickHandler);
  }
}
addClickListenersToAuthors();
