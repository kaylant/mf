// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'
// const {fp,vdom,lazy,hamt,csp,fetch,router} = u,
//     {debounce,m,html,rAF,mount,update,qs,container} = vdom

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => {
        app()
    })
}

// Check for ServiceWorker support before trying to install it
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./serviceworker.js').then(() => {
//         // Registration was successful
//         console.info('registration success')
//     }).catch(() => {
//         console.log('registration failed', e)
//             // Registration failed
//     })
//
//     const unregister = () => navigator.serviceWorker.getRegistrations().then(registrations => {
//         for (let registration of registrations) {registration.unregister()}
//     })
//     window.unregister = unregister
// } else {
//     // No ServiceWorker Support
// }

import DOM from 'react-dom'
import React, {Component} from 'react'
import Backbone from 'backbone'

//------------- Model-------------//

// Gerber all files => /api/v2/pcb/0dn5h4/1/files/gerber

var PCB = Backbone.Model.extend ({
	url: "/macrofab/pcb/0dn5h4/1/files/gerber?",
	defaults: {
		files: []
	},
	initialize: function(){
		this.on('change', () => {
			console.log(this.toJSON())
		})
	}
})

//------------- Views -------------//

var Nav = React.createClass ({
	render: function() {
		return (
			<div className="navBar">
				<div className="navContent">
					<img id="logo" src={`../images/mfLogo.png`}/>
					<ul className="navRight">
						<li>Pcbs</li>
						<li>Products</li>
						<li>Inventory<img src={`../images/ic_arrow_drop_down_black_24px.svg`}/></li>
						<li>House Parts</li>
						<li>Help<img src={`../images/ic_arrow_drop_down_black_24px.svg`}/></li>
						<li>demo.user@email.com<img src={`../images/ic_arrow_drop_down_black_24px.svg`}/></li>
					</ul>
				</div>
			</div>
			)
	}
})

var ProgressBar = React.createClass ({
	render: function() {
		return (
			<div className="progressBar">12345</div>
			)
	}
})

var PCBView = React.createClass ({
	getInitialState: function(){
		return {
			data: new PCB()		
		}
	},

	componentDidMount: function(){

		this.state.data.on('change', data => {
			this.setState({data: data})
		})

		this.state.data.fetch()

	},

	render: function(){
		return (
			<div>
				{/* <pre>{JSON.stringify(this.state.data)}</pre> */}
				<Nav/>
				<ProgressBar/>
				<div className="pcbContainer">
					{this.state.data.get('files').map(function(file, i) {
						var styleObj = {zIndex: -1, opacity: .5}
						return <img className="pcbImgs" src={`https://demo.development.macrofab.com/api/v2${file.url}?preview=1`} key={i} style={styleObj}/> 
						})
					}
				</div>
			</div>
		)
	}
})



function app() {
	DOM.unmountComponentAtNode(document.querySelector('.container'))
	DOM.render(<PCBView />, document.querySelector('.container'))
}

app()

