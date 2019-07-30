import React,  { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fetchSlugs: "NOT_SEND", // "SEND" "RECEIVED" "FAILED"
      fetchJSONS: "NOT_SEND", // "SEND" "RECEIVED" "FAILED"
      dashboardSlugs: [],
      dashboardJsons: [],
    }
  }

  componentDidMount() {
     this.fetchDashboardSlugs();
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.fetchSlugs === "RECEIVED" &&
      prevState.fetchSlugs !== "RECEIVED"
    ) {
      this.fetchDashboardJSONS(this.state.dashboardSlugs);
    }
  }

  fetchDashboardSlugs = () => {
    const that = this;
    this.setState(
      {
        fetchSlugs: "SEND",
      },
      () => {
        that.setState({
          fetchSlugs: "RECEIVED",
          dashboardSlugs: ["tom1","scenario1","dashboard2"],
        })
        // fetch( "/api/v4/dashboardSlugs/")
        // .then(function(response) {
        //   return response.json();
        // })
        // .then(function(parsedJSON) {
        //   that.setState({
        //     fetchSlugs: "RECEIVED",
        //     dashboardSlugs: parsedJSON ? parsedJSON : [],
        //   })
        // })
        // .catch(error => {
        //   that.setState({fetchSlugs: "FAILED"})
        //   console.error('Error:', error);
        // })
      }
    );
  }

  fetchDashboardJSONS = (slugs) => {
    const that = this;
    const relativeUrls = slugs.map(slug=>`/bootstrap/${slug}/`);
    const promises = relativeUrls.map(url=> fetch(url));

    
    this.setState(
      {
        fetchJSONS: "SEND",
      },
      () => {
        Promise.all(promises).then(promiseResults => {
          const parsed = promiseResults.map(res=>JSON.parse(res))
          that.setState({
            fetchJSONS: "RECEIVED",
            dashboardJsons: parsed ? parsed : [],
          })
        })
      }
      
    );
  }


  render () {
    return (
      <div className="App">
        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header> */}
      </div>
    )
  }
}
export default App;

// function App() {
//   return (
//     <div className="App">
//       {/* <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header> */}
//     </div>
//   );
// }


