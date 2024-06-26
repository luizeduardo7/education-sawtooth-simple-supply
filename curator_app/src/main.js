/**
 * Copyright 2018 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ----------------------------------------------------------------------------
 */
'use strict'

// These requires inform webpack which styles to build
require('bootstrap')
require('../styles/main.scss')

const m = require('mithril')

const api = require('./services/api')
const navigation = require('./components/navigation')

const AgentList = require('./views/agent_list')
const AgentDetailPage = require('./views/agent_detail')
const RegisterArtworkForm = require('./views/register_artwork_form')
const Dashboard = require('./views/dashboard')
const LoginForm = require('./views/login_form')
const ArtworkList = require('./views/artwork_list')
const ArtworkDetailPage = require('./views/artwork_detail')
const SignupForm = require('./views/signup_form')

/**
 * A basic layout component that adds the navbar to the view.
 */
const Layout = {
  view (vnode) {
    return [
      vnode.attrs.navbar,
      m('.content.container', vnode.children)
    ]
  }
}

const loggedInNav = () => {
  const links = [
    ['/register', 'Registrar Sensor'],
    ['/artworks', 'Ver Registro de Sensores'],
    ['/agents', 'Ver Usuários']
  ]
  return m(navigation.Navbar, {}, [
    navigation.links(links),
    navigation.link('/profile', 'Perfil'),
    navigation.button('/logout', 'Sair')
  ])
}

const loggedOutNav = () => {
  const links = [
    ['/artworks', 'Ver Registro de Sensores'],
    ['/agents', 'Ver Usuários']
  ]
  return m(navigation.Navbar, {}, [
    navigation.links(links),
    navigation.button('/login', 'Log in/Criar conta')
  ])
}

/**
 * Returns a route resolver which handles authorization related business.
 */
const resolve = (view, restricted = false) => {
  const resolver = {}

  if (restricted) {
    resolver.onmatch = () => {
      if (api.getAuth()) return view
      m.route.set('/login')
    }
  }

  resolver.render = vnode => {
    if (api.getAuth()) {
      return m(Layout, { navbar: loggedInNav() }, m(view, vnode.attrs))
    }
    return m(Layout, { navbar: loggedOutNav() }, m(view, vnode.attrs))
  }

  return resolver
}

/**
 * Clears user info from memory/storage and redirects.
 */
const logout = () => {
  api.clearAuth()
  m.route.set('/')
}

/**
 * Redirects to user's personal account page if logged in.
 */
const profile = () => {
  const publicKey = api.getPublicKey()
  if (publicKey) m.route.set(`/agents/${publicKey}`)
  else m.route.set('/')
}

/**
 * Build and mount app/router
 */
document.addEventListener('DOMContentLoaded', () => {
  m.route(document.querySelector('#app'), '/', {
    '/': resolve(Dashboard),
    '/agents': resolve(AgentList),
    '/agents/:publicKey': resolve(AgentDetailPage),
    '/register': resolve(RegisterArtworkForm, true),
    '/login': resolve(LoginForm),
    '/logout': { onmatch: logout },
    '/profile': { onmatch: profile},
    '/artworks': resolve(ArtworkList),
    '/artworks/:recordId': resolve(ArtworkDetailPage),
    '/signup': resolve(SignupForm)
  })
})
