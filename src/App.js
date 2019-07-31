import React,  { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { addGetParameter } from './urls';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fetchSlugs: "NOT_SEND", // "SEND" "RECEIVED" "FAILED"
      fetchJSONS: "NOT_SEND", // "SEND" "RECEIVED" "FAILED"
      dashboardSlugs: [],
      dashboardJsons: [],
      user: {},
      loginUrl: "",
      logoutUrl: "",
      /*
      {
        authenticated: true,
        first_name: "Tom", 
        username: "tom.deboer",
      }
      //*/
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

  getSlugsFromDashboardsObjectFromAPI= (dashboardsObject) => {
    // dashboardsJSON is assumed to be in format:
    /*
    {
      results: [
        {
          "url": "nxt3.staging.lizard.net/bootstrap/dashboard",
          "slug": "",
        },
        ...
      ],
      ...
    }
    //*/
    // We will use the slug instead of the url to make it easy to work with on dev (with the proxy)
    return dashboardsObject.results.map(dashb=>dashb.slug);
  }

  getRelevantDashboardDataFromJSON = (dashboardJSONS) => {
    console.log('dashboardJSONS', dashboardJSONS);
    return dashboardJSONS.filter(dashboardJSON=>{
      return dashboardJSON &&
      dashboardJSON.configuration &&
      dashboardJSON.configuration.meta
    }).map(dashboardJSON => {
      return {
        title: dashboardJSON.configuration.meta.title,
        description: dashboardJSON.configuration.meta.description,
        tags: dashboardJSON.configuration.meta.tags,
        metaData: dashboardJSON.configuration.meta.metaData,
        logo: dashboardJSON.configuration.meta.logo,
        logoCompanies: dashboardJSON.configuration.meta.logoCompanies,
      }
    })
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
          dashboardSlugs: that.getSlugsFromDashboardsObjectFromAPI({
            results: [
              {
                slug: "dashboard2",
              },
              {
                slug: "dashboard",
              },
              {
                slug: "tom1",
              },
              {
                slug: "scenario7", // this dashboard actually belongs to parramatta. This is to test for errors
              },
            ],
          }),
        })
        // fetch( "/api/v4/dashboardSlugs/")
        // .then(function(response) {
        //   return response.json();
        // })
        // .then(function(parsedJSON) {
        //   that.setState({
        //     fetchSlugs: "RECEIVED",
        //     dashboardSlugs: parsedJSON ? that.getSlugsFromDashboardsObjectFromAPI(parsedJSON) : [],
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
    const requestPromises = relativeUrls.map(url=> fetch(url));

    
    this.setState(
      {
        fetchJSONS: "SEND",
      },
      () => {
        Promise.all(requestPromises).then(requestResults => {
          const parsedPromises = requestResults.map(requestResult => requestResult.json());
          Promise.all(parsedPromises).then(parsedResults => {
            that.setState({
              fetchJSONS: "RECEIVED",
              dashboardJsons: parsedResults ? that.getRelevantDashboardDataFromJSON(parsedResults) : [],
              user: parsedResults && parsedResults[0]  ? parsedResults[0].user : {},
              loginUrl : parsedResults && parsedResults[0] && parsedResults[0].sso ? parsedResults[0].sso.login  : "",
              logoutUrl: parsedResults && parsedResults[0] && parsedResults[0].sso ? parsedResults[0].sso.logout : "",
            })
          })
        })
      }
      
    );
  }

  doLogin = () => {
    window.location = addGetParameter(
      this.state.loginUrl, 'next', window.location.href
    );
  }
  doLogout = () => {
    window.location = addGetParameter(
      this.state.logoutUrl, 'next', window.location.href
    );
  }


  render () {
    return (
      <div className="App">

        {this.state.dashboardJsons.map(dashboard=>{
          return (
            <div className="Dashboard">
              <h1>{dashboard.title || ""}</h1>
              {dashboard.logo?<img src={dashboard.logo}></img>:null}
              <p>{dashboard.description || ""}</p>
              <p>{dashboard.tags || ""}</p>
              <p>{dashboard.metaData || ""}</p>
              {dashboard.logoCompanies?<img src={dashboard.logoCompanies}></img>:null}
            </div>
          )

        })}
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


