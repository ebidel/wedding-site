# !/usr/bin/env python
#
# Copyright 2016 Eric Bidelman

__author__ = 'ericbidelman@ (Eric Bidelman)'

import logging
import os
import jinja2
import webapp2

IS_DEV = os.environ.get('SERVER_SOFTWARE', '').startswith('Dev')

jinja_loader = jinja2.FileSystemLoader(os.path.dirname(__file__))
env = jinja2.Environment(
  loader=jinja_loader,
  extensions=['jinja2.ext.autoescape'],
  autoescape=True,
  trim_blocks=True,
  variable_start_string='{{',
  variable_end_string='}}')

def render(out, template, data={}):
  try:
    t = env.get_template(template)
    out.write(t.render(data).encode('utf-8'))
  except jinja2.exceptions.TemplateNotFound as e:
    handle_404(None, out, data, e)
  except Exception as e:
    handle_500(None, out, data, e)

def handle_404(req, resp, data, e):
  resp.set_status(404)
  render(resp, '404.html', data)

def handle_500(req, resp, data, e):
  logging.exception(e)
  resp.set_status(500)
  render(resp, '500.html', data);


class Site(webapp2.RequestHandler):

  def post(self, path):
    #self.response.out.write("Thanks! We've received your RSVP")
    self.response.out.write("It's not time to submit yet! Please come back later.")

  def get(self, path):
    #self.response.headers['Content-Type'] = 'text/html'
    #self.response.write('Hello, World!')

    # Root / serves index.html.
    # Folders server the index file (e.g. /docs/index.html -> /docs/).
    if not path or path.endswith('/'):
      path += 'index.html'
    # Remove index.html from URL.
    elif path.endswith('index'):
      path = path[:path.rfind('/') + 1]
      # TODO: preserve URL parameters and hash.
      return self.redirect('/' + path, permanent=True)
    # Make URLs pretty (e.g. /page.html -> /page)
    elif path.endswith('.html'):
      path = path[:-len('.html')]
      return self.redirect('/' + path, permanent=True)

    # Add .html to construct template path.
    if not path.endswith('.html'):
      path += '.html'

    data = {
      'active_page': self.request.path
    }

    render(self.response, path, data)


app = webapp2.WSGIApplication([
  ('/(.*)', Site),
], debug=IS_DEV)

app.error_handlers[404] = handle_404
app.error_handlers[500] = handle_500
