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

//------------- Models-------------//

// Gerber all files => /api/v2/pcb/0dn5h4/1/files/gerber

var Base = Backbone.Model.extend ({
	url: function(){
		return "/macrofab/pcb/0dn5h4/1/?apikey="+this.apikey
	},
	defaults: {
		files: []
	},
	initialize: function(){
		this.on('change', () => {
			// console.log(this.toJSON())
		})
	}
})

var PCB = Backbone.Model.extend ({
	url: function(){
		return "/macrofab/pcb/0dn5h4/1/files/gerber?apikey="+this.apikey
	},
	defaults: {
		files: []
	},
	initialize: function(){
		this.on('change', () => {
			// console.log(this.toJSON())
		})
	}
})

var Parts = Backbone.Model.extend ({
	url: function(){
		return "/macrofab/pcb/0dn5h4/1/placement?apikey="+this.apikey
	},
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
						<li>PCBs</li>
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
			<div className="progressBar">
				<div className="progress1"><div className="menu1">1</div><div className="line1"></div>PCB Specifications</div>
				<div className="progress2"><div className="menu2">2</div><div className="line2"></div>Design Files</div>
				<div className="progress3"><div className="menu3">3</div><div className="line3"></div>PCB</div>
				<div className="progress4"><div className="menu4">4</div><div className="line4"></div>Bill of Materials</div>
				<div className="progress5"><div className="menu5">5</div><div className="line5"></div>Placement</div>
			</div>
			)
	}
})

var PCBView = React.createClass ({
	getInitialState: function(){
		return {
			className: "boardView_1",
			base: new Base(),
			data: new PCB(),
			parts: new Parts(),
			apikey:prompt("Enter your API key")
		}
	},

	enterKey: function(){
		if (this.state.apikey) { 
			this.state.data.apikey = this.state.apikey
			this.state.parts.apikey = this.state.apikey
			this.state.base.apikey = this.state.apikey

			this.state.base.on('change', base => {
				this.setState({base: base})
			})

			this.state.data.on('change', data => {
				this.setState({data: data})
			})

			this.state.parts.on('change', parts => {
				this.setState({parts: parts})
			})

			this.state.base.fetch()
			this.state.data.fetch()
			this.state.parts.fetch()
		}
	},

	componentWillMount: function(){
		this.enterKey()
	},

	_showSide1Parts: function() {
		var parts = this.state.parts.get('placements')
		var partsListContainer = document.querySelector(".partsListContainer")
		var partsListArr = []
		if(parts) {
			for (var i=0; i<parts.length; i++) {
				var singlePart = parts[i]
				for (var prop in singlePart) {
					var side = singlePart["side"]
					var partName = singlePart["part"]
				}
				if (side === "1") {
					partsListArr.push(partName)
				}

			}

		}
		partsListContainer.textContent = `Top Part List: ` + partsListArr

	},

	_showTop: function(){
		this.setState({className: "boardView_1"})
		var boardObjects = this.state.data.get('files')
		var list = document.querySelector("#listContainer")
		var titlesArr = []
		if(boardObjects) {
			for (var i=boardObjects.length-1; i >0; i--) {
				var boardObj = boardObjects[i]
				for (var prop in boardObj) {
					var titles = boardObj["title"]
				}
				titlesArr.push(titles)
			}
		}
		list.textContent = titlesArr
		this._showSide1Parts()
	},

	_showSide2Parts: function() {
		var parts = this.state.parts.get('placements')
		var partsListContainer = document.querySelector(".partsListContainer")
		var partsListArr = []
		if(parts) {
			for (var i=0; i<parts.length; i++) {
				var singlePart = parts[i]
				for (var prop in singlePart) {
					var side = singlePart["side"]
					var partName = singlePart["part"]
				}
				if (side === "2") {
					partsListArr.push(partName)
				}

			}

		}
		partsListContainer.textContent = `Bottom Part List: ` + partsListArr

	},

	_showBottom: function(){
		this.setState({className: "boardView_2"})
		var boardObjects = this.state.data.get('files')
		var list = document.querySelector("#listContainer")
		var titlesArr = []
		if(boardObjects) {
			for (var i=0; i<boardObjects.length; i++) {
				var boardObj = boardObjects[i]
				for (var prop in boardObj) {
					var titles = boardObj["title"]
				}
				titlesArr.push(titles)
			}
		}
		list.textContent = titlesArr
		this._showSide2Parts()
	},

	_calculateXCoord: function(){
		var parts = this.state.parts.get('placements')
		if (parts) {
			var x1 = this.state.parts.get('placements')[54]
			console.log(x1)
			for (var prop in x1) {
				var xCoord = x1["x_origin"]
			}
		if (this.state.className === "boardView_2") {
				return xCoord
			} else {
				return (2490 - xCoord)
			}
		}
	},	

	_isometric: function(){
		this.setState({className: "boardView_3"})
		var boardObjects = this.state.data.get('files')
		var list = document.querySelector("#listContainer")
		var titlesArr = []
		if(boardObjects) {
			for (var i=boardObjects.length-1; i >0; i--) {
				var boardObj = boardObjects[i]
				for (var prop in boardObj) {
					var titles = boardObj["title"]
				}
				titlesArr.push(titles)
			}
		}
		list.textContent = titlesArr
		this._showSide1Parts()
	},

	render: function(){
		var boardObjects = this.state.data.get('files')
		var titlesArr = []
		if(boardObjects) {
			for (var i=0; i<boardObjects.length; i++) {
				var boardObj = boardObjects[i]
				for (var prop in boardObj) {
					var titles = boardObj["title"]
				}
				titlesArr.push(titles)
			}
		}

		var parts = this.state.parts.get('placements')
		if (parts) {
			var x1 = this.state.parts.get('placements')[54]
			console.log(x1)
			for (var prop in x1) {
				var partName = x1["part"]
				var xCoord = x1["x_origin"]
				var yCoord = x1["y_origin"]
			}
		}

		return (
			<div className="mainContainer">
				{/* <pre>{JSON.stringify(this.state.data)}</pre> */}
				<Nav/>
				<ProgressBar/>
				<div className="pcbDetailsContainer">
					<div className="boardContainer">
						<div id="wrapper">
							<div className={this.state.className}>
								{boardObjects.map(function(file, i) {
								var styleObj = {zIndex: -1, opacity: .5}							
									return <img className="pcbImgs" src={`https://demo.development.macrofab.com/api/v2${file.url}?preview=1`} key={i} style={styleObj} id={`iso${i}`}/> 								
									})
								}
							</div>
						</div>
					</div>
					<div className="controlsContainer">
						<p>Board Layers</p>
						<button onClick={this._showTop}>Top</button>
						<button onClick={this._showBottom}>Bottom</button>
						<button onClick={this._isometric}>Isometric</button>
						<div id="listContainer">
							<ul className="boardLayerli">
								<li>{titlesArr[9]}</li>
								<li>{titlesArr[8]}</li>
								<li>{titlesArr[7]}</li>
								<li>{titlesArr[6]}</li>
								<li>{titlesArr[5]}</li>
								<li>{titlesArr[4]}</li>
								<li>{titlesArr[3]}</li>
								<li>{titlesArr[2]}</li>
								<li>{titlesArr[1]}</li>
								<li>{titlesArr[0]}</li>
							</ul>
						</div>
					</div>
				</div>
				<div className="partsListContainer"></div>
				<div className="samplePartDetails">
					<p>Part Details</p>
					<ul className="partsDetailsli">
						<li>Part Name: {partName} </li>
						<li>Part Coordinates:</li>
						<li>X: {this._calculateXCoord()} mils *Changes Depending on board orientation</li>
						<li>Y: {yCoord} mils</li>
					</ul>
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

