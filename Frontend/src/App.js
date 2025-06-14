import './App.css';
import Navbar from './components/Navbar.js';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './components/Home.js';
import LoginComponent from './components/LoginComponent.js';
import Signup from './components/Signup.js';
import ProductDetails from './components/ProductDetails.js';
import Chat from './components/Chat.js';

function App() {
	return (
		<Router>
			<div className="App" style={{height: "100vh", overflow: "hidden"}}>
				<Navbar isLoggedIn={false}/>
				<div className="content" style={{height: "calc(100% - 56px)", overflow: "auto"}}>
					<Routes>
						<Route path='/' element={<Home />} />
						<Route path='/product-details/:id' element={<ProductDetails />} />
						<Route path='/login' element={<LoginComponent />} />
						<Route path='/signup' element={<Signup />} />
						<Route path='/chat' element={<Chat />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default App;
