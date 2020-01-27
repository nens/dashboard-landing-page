import React,  { Component } from 'react';
import MDSpinner from "react-md-spinner";

import backgroundImage from './background.svg';
import './App.css';
import { addGetParameter } from './urls';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fetchSlugs: "NOT_SEND", // "SEND" "RECEIVED" "FAILED"
      fetchJSONS: "NOT_SEND", // "SEND" "RECEIVED" "FAILED"
      clientConfigurations: [], // from api/v4/clientconfiguration
      dashboardJsons: [], // from /bootstrap 
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
      this.fetchDashboardJSONS(this.state.clientConfigurations);
    }
  }

  getRelevantDashboardDataFromJSON = (dashboardJSONS, clientConfigurations) => {
    // save slug next to json in same object because it is needed later to create url href
    return dashboardJSONS.map((dashboardJSON, i)=>{
      return {
        json: dashboardJSON,
        slug: clientConfigurations[i],
      }
    })
    // filter out those dashboards that do not have a meta object 
    .filter(dashboardJsonObj=>{
      return dashboardJsonObj.json &&
        dashboardJsonObj.json.configuration &&
        dashboardJsonObj.json.configuration.meta
    })
    // map the required fields needed to generate the html
    .map(dashboardJsonObj => {
      return {
        title: dashboardJsonObj.json.configuration.meta.title,
        description: dashboardJsonObj.json.configuration.meta.description,
        tags: dashboardJsonObj.json.configuration.meta.tags,
        metadata: dashboardJsonObj.json.configuration.meta.metadata,
        logo: dashboardJsonObj.json.configuration.meta.logo,
        logoCompanies: dashboardJsonObj.json.configuration.meta.logoCompanies,
        slug: dashboardJsonObj.slug,
        isPublic: dashboardJsonObj.json.configuration.isPublic
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
        fetch( "/api/v4/clientconfigurations/?page_size=1000&portal__domain="+ window.location.hostname)
        .then(function(response) {
          return response.json();
        })
        .then(function(parsedJSON) {
          that.setState({
            fetchSlugs: "RECEIVED",
            clientConfigurations: parsedJSON ? parsedJSON.results : [],
          })
        })
        .catch(error => {
          that.setState({fetchSlugs: "FAILED"})
          console.error('Error:', error);
        })
      }
    );
  }

  fetchDashboardJSONS = (clientConfigurations) => {
    const that = this;
    const relativeUrls = clientConfigurations.map(clientConfiguration=>`/bootstrap/${clientConfiguration.client_slug}/`);
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
              dashboardJsons: parsedResults ? that.getRelevantDashboardDataFromJSON(parsedResults, that.state.clientConfigurations) : [],
              user: parsedResults && parsedResults[0]  ? parsedResults[0].user : {},
              loginUrl : parsedResults && parsedResults[0] && parsedResults[0].sso ? parsedResults[0].sso.login  : "",
              logoutUrl: parsedResults && parsedResults[0] && parsedResults[0].sso ? parsedResults[0].sso.logout : "",
            })
          })
        })
      }
      
    );
  }

  getLoginUrl = () => {
    return addGetParameter(
      this.state.loginUrl, 'next', window.location.href
    );
  }
  getLogoutUrl = () => {
    return addGetParameter(
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
        <div className="background-box">
          <img src={backgroundImage} alt="background" className="background-image"/>
        </div>

        <header>
          <div>
            {/* back */}
            <a className="Back" href="/dashboards">&larr;</a>
            
            {/* user / login */}
            {/* eslint-disable-next-line */}
            <a
              id="user_dropdown_toggle"
              href="#"
            >
              {/* 
                - This is the pageblocker that shows when the dropdown is shown. It captures clicks for the dropdown to close.
                - The id is required to be on this element because the browser will scroll to the element with the id.
                In this case the element is positioned to the top so there wil be no annoying scroll. 
              */}
            </a>

            {this.state.user.authenticated === true ?
              <div className="Dropdown">
                <div
                  className="DropdownClosed"
                >
                  <a 
                    href="#user_dropdown_toggle" 
                  >
                    <i className="fa fa-caret-down" />
                    &nbsp;&nbsp;
                    <i className="fa fa-user" />
                    &nbsp;&nbsp;
                    {this.state.user.first_name}
                  </a>
                </div>
                <div
                  className="DropdownOpen"
                >
                  {/* eslint-disable-next-line */}
                  <a href="#">
                    <i className="fa fa-caret-up" />
                    &nbsp;&nbsp;
                    <i className="fa fa-user" />
                    &nbsp;&nbsp;
                    {this.state.user.first_name}
                  </a>
                  <div
                    className="DropDownContent"
                  >
                    <a href="https://sso.lizard.net/edit_profile/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-pencil" />
                      &nbsp;&nbsp;Edit&nbsp;Profile
                    </a>
                    <a href={this.getLogoutUrl()} >
                      <i className="fa fa-power-off" />
                      &nbsp;&nbsp;Logout
                    </a>
                  </div>
                </div>
              </div>
              :
              this.state.fetchSlugs === "RECEIVED" &&
              this.state.fetchJSONS === "RECEIVED" ?
              <a href={this.getLoginUrl()}>Login</a>
              : 
              null
            }
          </div>
          <div>
            <h1 className="FullTitle">Dashboards</h1>
            <h1 className="ShortTitle">Dashboards</h1>
          </div>
        </header>
        <body>
          <div className="DashboardList">
            {this.state.dashboardJsons.map((dashboard, i)=>{
              return (
                <a 
                  className="Dashboard"
                  key={i}
                  href={dashboard.slug.client_config_url}
                >
                  <div className="Logo">
                    {dashboard.logo?<img src={this.getImageUrl(dashboard.logo)} alt="logo"></img>:null}
                  </div>
                  <div className="Info">
                    <h2>{dashboard.title || ""}&nbsp;{dashboard.isPublic !== true && this.state.user.authenticated !== true ? ( <i title="login required" className="fa fa-lock" />): ""}</h2>
                    <p>{dashboard.description || ""}</p>
                    <div  className="MetaTags">
                      <div>{dashboard.tags || ""}</div>
                      <span>{dashboard.metadata || ""}</span>
                    </div>
                  </div>
                  <div  className="Logo LogoCompany">
                    {dashboard.logoCompanies?<img src={this.getImageUrl(dashboard.logoCompanies)} alt="logo"></img>:null}
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

          {/* <div className="ExplainColumn">
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
              <div>
                Neem eventueel contact op met de helpdesk. Dit kan namelijk namelijk sterk per dashboard verschillen, maar er zijn een aantal dingen steeds hetzelfde:
                <ul>
                  <li>Open het dashboard door erop te klikken links in dit scherm.</li>
                  <li>Het dashboard bestaat uit tiles. U kunt tiles fullscreen maken door erop te klikken</li>
                  <li>In zowel map als chart tiles kunt u zoomen en pannen met de muis.</li>
                  <li>Op een kaart kunt u bepaalde elementen aanklikken om de waarde te tonen.</li>
                </ul>
              </div>
            </article>
          </div> */}
        </body>
      </div>
    )
  }
}
export default App;




