import React,  { Component } from 'react';
import MDSpinner from "react-md-spinner";

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
    // return dashboardsObject.results.map(dashb=>dashb.slug);
    return dashboardsObject.results;//.results.map(dashb=>dashb.slug);
  }

  getRelevantDashboardDataFromJSON = (dashboardJSONS, dashboardSlugs) => {
    console.log('dashboardJSONS', dashboardJSONS, dashboardSlugs);
    return dashboardJSONS.map((dashboardJSON, i)=>{
      return {
        json: dashboardJSON,
        slug: dashboardSlugs[i],
      }
    }).filter(dashboardJsonObj=>{
      return dashboardJsonObj.json &&
        dashboardJsonObj.json.configuration &&
        dashboardJsonObj.json.configuration.meta
    }).map(dashboardJsonObj => {
      return {
        title: dashboardJsonObj.json.configuration.meta.title,
        description: dashboardJsonObj.json.configuration.meta.description,
        tags: dashboardJsonObj.json.configuration.meta.tags,
        metadata: dashboardJsonObj.json.configuration.meta.metadata,
        logo: dashboardJsonObj.json.configuration.meta.logo,
        logoCompanies: dashboardJsonObj.json.configuration.meta.logoCompanies,
        slug: dashboardJsonObj.slug,
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
                url: "https://nxt3.staging.lizard.net/dashboard/dashboard2",
              },
              {
                slug: "dashboard",
                url: "https://nxt3.staging.lizard.net/dashboard/dashboard",
              },
              {
                slug: "tom1",
                url: "https://nxt3.staging.lizard.net/dashboard/tom1",
              },
              {
                slug: "scenario7", // this dashboard actually belongs to parramatta. This is to test for errors
                url: "https://nxt3.staging.lizard.net/dashboard/scenario7",
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
    const relativeUrls = slugs.map(slug=>`/bootstrap/${slug.slug}/`);
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
              dashboardJsons: parsedResults ? that.getRelevantDashboardDataFromJSON(parsedResults, that.state.dashboardSlugs) : [],
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

  getImageUrl = (url) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      return url;
    } else {
      return "/dashboard/" + url;
    }
  }

  render () {

    return (
      <div className="App">

        <header>
          <div>
            {/* back */}
            <a href="/dashboards">&larr;</a>
            {/* user / login */}
            <a href="/">Login</a>
          </div>
          <div>
            <h1>Mijn Dashboards</h1>
          </div>
        </header>
        <body>

        
          <div className="DashboardList">
            
            
            
            {this.state.dashboardJsons.map(dashboard=>{
              return (
                <a 
                  className="Dashboard"
                  href={dashboard.slug.url}
                >
                  <div className="Logo">
                    {dashboard.logo?<img src={this.getImageUrl(dashboard.logo)}></img>:null}
                  </div>
                  <div className="Info">
                    <h2>{dashboard.title || ""}</h2>
                    <p>{dashboard.description || ""}</p>
                    <div  className="MetaTags">
                      <div>{dashboard.tags || ""}</div>
                      <span>{dashboard.metadata || ""}</span>
                    </div>
                  </div>
                  <div  className="Logo LogoCompany">
                    {dashboard.logoCompanies?<img src={this.getImageUrl(dashboard.logoCompanies)}></img>:null}
                  </div>
                </a>
              )

            })}
            <div 
              className="Spinner"
              style={
                this.state.fetchSlugs === "RECEIVED" &&
                this.state.fetchJSONS === "RECEIVED" ?
                {visibility: "hidden"}
                :
                {}
              }
            >
              <MDSpinner 
                size={164}
                singleColor={"#115E67"}
              />
            </div>
          </div>

          <div className="ExplainColumn">
            <article>
              <h1>
                Wat is een dashboard?
              </h1>
              <p>
                Met een dashboard kunt u situaties in real-time te volgen.
                Het bevat geografische data in de vorm van kaarten of tijdseries in de vorm van charts.
                Verder kunnen ook statische modellen worden getoond.
                Een dashboard toont deze data in een of meerdere tiles. 
                Onze adviseurs kunnen deze tiles naar u wensen configureren.
              </p>
            </article>
            
            <article>
              <h1>
                Hoe gebruik ik mijn dashboard?
              </h1>
              <p>
                Neem eventueel contact op met de helpdesk. Dit kan namelijk namelijk sterk per dashboard verschillen, maar er zijn een aantal dingen steeds hetzelfde:
                <ul>
                  <li>Open het dashboard door erop te klikken links in dit scherm.</li>
                  <li>Het dashboard bestaat uit tiles. U kunt tiles fullscreen maken door erop te klikken</li>
                  <li>In zowel map als chart tiles kunt u zoomen en pannen met de muis.</li>
                  <li>Op een kaart kunt u bepaalde elementen aanklikken om de waarde te tonen.</li>
                </ul>
              </p>
            </article>
            
            {/* <article>
              <h1>
                Nog een andere vraag?
              </h1>
              <p>
                Wat is het fijn om een dashboard te zijn !
              </p>
            </article> */}
          </div>
        </body>
        
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


