var path = require('path')
var choo = require('choo')
var html = require('choo/html')
var read = require('read-directory')
var nmd = require('nano-markdown')
var msum = require('markdown-summary')
var css = require('sheetify')

css('tachyons')
css('./markdown.css')

var app = choo()
app.use(store)
app.route('/', layout(archiveView))
app.route('/:page', layout(archiveView))
app.route('/p/:id/:title', layout(singleView))
app.mount('body')

function store (state, emitter) {
  state.title = 'Bloog ✨'
  state.posts = {}
  var posts = read.sync(path.join(__dirname, 'posts'))

  Object.keys(posts).forEach(function (k) {
    state.posts[k] = {
      title: msum.title(posts[k]),
      content: posts[k],
      summary: msum.summary(posts[k]),
      image: msum.image(posts[k])
    }
  })

  state.ids = Object.keys(state.posts).sort().reverse()
  state.perPage = 5
  state.pages = Math.ceil(state.ids.length / state.perPage)
}

function layout (view) {
  return function (state, emit) {
    return html`
      <body>
         <a class="link dim black b f1 f-subheadline-ns tc db mb3 mb4-ns" href="/#" title="Home">incessantmeraki</a>
				 ${view(state, emit)}
      </body>
    `
  }
}

function archiveView (state, emit) {
  var posts = paginate(state.ids, state.params.page, state.perPage)
  return html`
		<div class="mw9 center ph3-ns">
			<div class="cf ph2-ns">
				<div class="fl w-100 w-75-ns pa2">
					<div class="bg-white pv4">
						${posts.map(function (id) {
							return previewEl(id,state.posts[id].title, state.posts[id].summary)
						})}
						${prevNextEl(state)}
					</div>
				</div>
				<div class="fl w-100 w-25-ns pa2">
					<div class="bg-white pv4">
					</div>
				</div>
			</div>
    </div>
  `
}

function singleView (state, emit) {
  var id = state.params.id
  var title = state.params.title
  return postEl(id, state.posts[id].content)
}

function paginate (posts, page, perPage) {
  page = Number(page) || 1
  return posts.slice(perPage * (page - 1), page * perPage)
}

function postEl (id, content ) {
  var article = html`<article class="mw8 center markdown-body"></article>`
  article.innerHTML = nmd(content)
  return article
}

function previewEl (id,title, content) {
  var article = html`<article></article>`
  var titleLink = title.split(' ').join('-').slice(2).toLowerCase()
  article.innerHTML = nmd(title) + nmd(content)
  article.appendChild(html`<p>${linkEl('/p/' + id + '/' + titleLink, '🔗')}</p>`)
  return article
}

function prevNextEl (state) {
  var page = Number(state.params.page) || 1
  var hasNext = page - 1
  var hasPrev = page + 1 <= state.pages
  return html`
    <nav>
      ${hasNext ? linkEl(page - 1 === 1 ? '/' : '/' + (page - 1), 'Next') : ''}
      ${hasPrev ? linkEl('/' + (page + 1), 'Previous') : ''}
    </nav>
  `
}

function linkEl (url, text) {
  return html`<a href="${url}">${text}</a>`
}
