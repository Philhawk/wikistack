function makeTitleUrl(title){
  return title.split(' ').join('_').toLowerCase()
}

module.exports = {
  makeTitleUrl: makeTitleUrl
}
