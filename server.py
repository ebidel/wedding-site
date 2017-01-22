# !/usr/bin/env python
#
# Copyright 2016 Eric Bidelman

__author__ = 'ericbidelman@ (Eric Bidelman)'

import datetime
import logging
import os
import jinja2
import json
import webapp2

from google.appengine.api import mail
from google.appengine.ext import ndb

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
    handle_404(None, out, e)
  except Exception as e:
    handle_500(None, out, e)

def handle_404(req, resp, e):
  resp.set_status(404)
  render(resp, '404.html', e)

def handle_500(req, resp, e):
  logging.exception(e)
  resp.set_status(500)
  resp.out.write(e)


class Site(webapp2.RequestHandler):

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
      'active_page': self.request.path,
    }

    render(self.response, path, data)


HOTELS = {
  'hotel1': 'Hawthorne Suites, Napa Valley',
  'hotel2': 'Courtyard Marriott, Marin Sonoma',
  'other': 'Other'
}

MEALS = {
  'beef': 'Beef - grilled bistro filet (gluten free)',
  'fish': 'Fish - crispy skin artic char',
  'pasta': 'Pasta - wild mushroom ravioli (vegetarian)'
}

def send_mail(rsvp):
  message = mail.EmailMessage(
      sender='jackieeric@jackieeric-wedding.appspotmail.com',
      subject='New RSVP - %s' % rsvp.party_name)
  message.to = 'laubidelman@gmail.com'

  attending_str = 'attending' if rsvp.attending else 'not attending'
  message.body = """
%s is %s.

See their details at https://jackieeric.com/rsvp_list.
""" % (rsvp.party_name, attending_str)

  message.send()


class Guest(ndb.Model):
  name = ndb.StringProperty(required=True)
  meal = ndb.StringProperty(choices=['beef', 'fish', 'pasta'], required=True)
  vegan = ndb.BooleanProperty(default=False)
  dairy_free = ndb.BooleanProperty(default=False)


class RSVP(ndb.Model):
  date = ndb.DateTimeProperty(auto_now_add=True)
  attending = ndb.BooleanProperty()
  guests = ndb.StructuredProperty(Guest, repeated=True)
  party_name = ndb.StringProperty()
  hotel = ndb.StringProperty(choices=HOTELS.keys())
  taking_shuttle = ndb.BooleanProperty()
  shuttle_email = ndb.StringProperty()


class RSVPPage(webapp2.RequestHandler):

  def get(self):
    data = {
      'active_page': self.request.path,
      'rsvp': None,
      'HOTELS': HOTELS,
      'MEALS': MEALS,
    }
    render(self.response, 'rsvp.html', data)

  def post(self):
    party_name = self.request.params.get('party_name', None)

    rsvp = RSVP(
        parent=ndb.Key('Responses', '*notitle*'),
        party_name=party_name,
        attending=self.request.params.get('rsvp') == 'yes',
        guests=[
          Guest(
            name=self.request.params.get('guest1_name', party_name),
            meal=self.request.params.get('guest1_meal', None),
            dairy_free='dairy' in self.request.params.getall('guest1_dietary'),
            vegan='vegan' in self.request.params.getall('guest1_dietary'),
          )
        ],
        hotel=self.request.params.get('hotel', None),
        taking_shuttle=self.request.params.get('taking_shuttle') == 'yes',
        shuttle_email=self.request.params.get('shuttle_email', None)
        )

    if self.request.params.get('guest2_name', None) != '':
      rsvp.guests.append(Guest(
        name=self.request.params.get('guest2_name', None),
        meal=self.request.params.get('guest2_meal', None),
        dairy_free='dairy' in self.request.params.getall('guest2_dietary'),
        vegan='vegan' in self.request.params.getall('guest2_dietary'),
      ))
    rsvp.put()

    try:
      send_mail(rsvp)
    except:
      pass

    data = {
      'active_page': self.request.path,
      'HOTELS': HOTELS,
      'MEALS': MEALS,
      'rsvp': rsvp
    }

    render(self.response, 'rsvp.html', data)


def get_rsvps():
  q = RSVP.query().order(-RSVP.date)
  responses = q.fetch()

  num_yes = len(RSVP.query().filter(RSVP.attending == True).fetch())
  num_no = len(responses) - num_yes

  data = {
    'responses': responses,
    'num_yes': num_yes,
    'num_no': num_no,
  }

  return data


class RSVPAdmin(webapp2.RequestHandler):

  def get(self):
   render(self.response, 'rsvp_list.html', get_rsvps())


class RSVPData(webapp2.RequestHandler):

  def __verify_auth_header(self):
    auth_header = self.request.headers.get('Authorization')

    #if (auth_header is None or not 'Basic' in auth_header):
    #  self.response.set_status(401)
    #  return self.response.out.write('{error: "Nice try bud."}')

    #username, password = base64.b64decode(auth_header.split(' ')[1])

    api_key = None
    with open('keyfile.txt', 'r') as f:
      api_key = f.read().strip()

    if auth_header != api_key:
      self.response.set_status(401)
      return self.response.out.write('{error: "Nice try bud."}')

  def output_json(self, s):
    resp = {
      "speech": s,
      "displayText": s,
      #"data": {...},
      #"contextOut": [...],
      "source": "https://jackieeric.com/rsvp/data"
    }

    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json.dumps(resp))

  def __get_days_left(self):
    today = datetime.date.today()
    wedding = datetime.date(2017, 7, 8)

    days = (wedding - today).days

    days_str = 'days' if days > 1 else 'day'

    # Before wedding.
    if days > 0:
      word = 'are' if days > 1 else 'is'
      s = 'There %s %s %s until your wedding.' % (word, days, days_str)
    # After wedding.
    else:
      s = "It's been %s %s since your wedding." % (days, days_str)

    return s

  def __get_rsvps(self):
    rsvps = get_rsvps()

    num_responses = len(rsvps['responses'])
    percent_attending = (int(rsvps['num_yes']) / num_responses) * 100

    s = ("There are %s responses so far with %s yesses and %s noes. " +
         "That's a %s%% acceptance rate.") % (num_responses, rsvps['num_yes'],
                                              rsvps['num_no'], percent_attending)
    return s

  def post(self):
    self.__verify_auth_header()

    obj = json.loads(self.request.body)

    action = obj.get('result').get('action')
    if action == 'get_days':
      s = self.__get_days_left()
    else:
      s = self.__get_rsvps();

    # JSON encode db results.
    #rsvps['responses'] = [response.to_dict() for response in rsvps['responses']]
    #for resp in rsvps['responses']:
    #  resp['date'] = resp['date'].isoformat()

    self.output_json(s)


app = webapp2.WSGIApplication([
  ('/rsvp_list', RSVPAdmin),
  ('/rsvp/data', RSVPData),
  ('/rsvp', RSVPPage),
  ('/(.*)', Site),
], debug=IS_DEV)

app.error_handlers[404] = handle_404
app.error_handlers[500] = handle_500
