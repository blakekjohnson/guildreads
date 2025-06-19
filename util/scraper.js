import * as cheerio from 'cheerio';

const USER_PAGE_BASE_URL = 'https://www.goodreads.com/review/list/';
const USER_PAGE_PARAMS = 'shelf=read&sort=date_read';

const RATING_MAPPING = {
  'did not like it': 1,
  'it was okay': 2,
  'liked it': 3,
  'really liked it': 4,
  'it was amazing': 5,
};

async function getUserReadBooksPage(userId) {
  const res = await fetch(
    `${USER_PAGE_BASE_URL}/${userId}?${USER_PAGE_PARAMS}`
  );

  const data = res.text();
  return data;
}

function getUserNameFromPageTitle(pageTitle) {
  try {
    const matches = pageTitle.matchAll(/(.*)\’s \'read\' books on Goodreads/g);
    return [...matches][0][1];
  } catch (e) {
    return undefined;
  }
}

function getFullSizeBookImage(compressedBookImageUrl) {
  return compressedBookImageUrl.replace(/(_S[XY][0-9]*_\.)/g, '');
}

async function parseUserReadBooksPage(pageHtml) {
  const pageInstance = cheerio.load(pageHtml);

  const pageTitle = pageInstance('title')
    .text()
    .trim();
  const userName = getUserNameFromPageTitle(pageTitle); 

  const bookElements = pageInstance('.bookalike');
  let books = [];
  bookElements.each((_, bookElement) => {
    const compressedBookImageUrl = pageInstance(bookElement)
      .find('.cover')
      .find('img')
      .prop('src');
    const bookImage = getFullSizeBookImage(compressedBookImageUrl);

    const readTimestamp = new Date(
      Date.parse(
        pageInstance(bookElement)
          .find('.date_read')
          .find('span')
          .text().trim()
      ));

    const bookTitle = pageInstance(bookElement)
      .find('.title')
      .find('a')
      .prop('title');

    const authorName = pageInstance(bookElement)
      .find('.author')
      .find('a')
      .text()
      .trim();

    const ratingTitle = pageInstance(bookElement)
      .find('.rating')
      .find('.notranslate')
      .prop('title');
    const rating = RATING_MAPPING[ratingTitle];

    const readBookData = {
      readTimestamp,
      bookTitle,
      authorName,
      bookImage,
      rating,
    };
    books = [ readBookData, ...books ];
  });

  return {
    userName,
    books
  };
}

async function getReadBooksForUser(userId) {
  const userReadBooksPage = await getUserReadBooksPage(userId);
  const userReadBooks = await parseUserReadBooksPage(userReadBooksPage);

  return userReadBooks;
}

export {
  getReadBooksForUser,
}

