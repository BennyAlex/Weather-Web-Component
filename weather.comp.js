import { html, render } from "https://unpkg.com/lit-html@1.1.2/lit-html.js";

class WeatherWidget extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    render(this.template(), this.root, { eventContext: this });

    this.weather = {
      temp: undefined,
      desc: undefined,
      state: undefined,
      dt: undefined
    };
    this._imageUrl = undefined;
  }

  static get observedAttributes() {
    return ["city"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue !== oldValue) {
      if (name === "city") this.city = newValue;
    }
  }

  weatherIcons = {
    clear: "wi-day-sunny",
    clouds: "wi-cloudy",
    hail: "wi-hail",
    haze: "wi-day-haze",
    rain: "wi-rain",
    fog: "wi-day-fog",
    sleet: "wi-sleet",
    sun: "wi-day-sunny",
    snow: "wi-snow",
    storm: "wi-storm-showers",
    thunder: "wi-thunderstorm",
    wind: "wi-windy"
  };

  weatherIconUrl() {
    if (this.weather && this.weather.state) {
      const icon = this.weatherIcons[this.weather.state.toLowerCase()]
        ? this.weatherIcons[this.weather.state.toLowerCase()]
        : "wi-cloud";
      return `https://raw.githubusercontent.com/erikflowers/weather-icons/master/svg/${icon}.svg?sanitize=true`;
    }
  }

  days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thuesday",
    "Friday",
    "Saturday"
  ];

  months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  asTwoDigitals(num) {
    return num < 10 ? "0" + num : num;
  }

  get datetime() {
    if (this.weather && this.weather.dt) {
      const dt = this.weather.dt;
      const two = this.asTwoDigitals;
      return {
        day: `${this.days[dt.getDay()]}`,
        date: `${two(dt.getDate())}. ${this.months[dt.getMonth()]}`,
        time: `${two(dt.getHours())}:${two(dt.getMinutes())}`
      };
    }
  }

  get city() {
    return this.getAttribute("city");
  }

  set city(val) {
    this.setAttribute("city", val);
    this.refresh();
  }

  get imageUrl() {
    return this._imageUrl;
  }

  set imageUrl(val) {
    this._imageUrl = val;
    render(this.template(), this.root, { eventContext: this });
  }

  _getImage() {
    const query =
      this.weather && this.weather.state ? this.weather.state : "sky";

    const request = new Request(
      `https://api.unsplash.com/search/photos/?client_id=16001d522d9f6215621cd360e2c34f724b3f60b950afc3ed8f724c4dbefe24f6&page=1&per_page=25&orientation=portrait&query=${query}`
    );

    return fetch(request)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then(res => {
        this.imageUrl = `${
          res.results[Math.round(Math.random() * 24)].urls.raw
        }&w=320&h=300&fit=crop`;
        return;
      })
      .catch(error => {
        console.error(error);
      });
  }

  refresh() {
    const baseURL = "https://api.openweathermap.org/data/2.5/weather?q=";
    const URL = `${baseURL}${this.city}&units=metric&appid=9f87f8b18ba7c54e3e75cd0e1fea9dd7`;

    const request = new Request(URL);

    return fetch(request)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then(res => {
        this.weather = {
          state: res.weather[0].main,
          desc: res.weather[0].description,
          temp: Math.floor(res.main.temp || res.temperature.value),
          dt: new Date()
        };
        this._getImage();
        render(this.template(), this.root, { eventContext: this });
      })
      .catch(error => {
        console.error(error);
      });
  }

  style = html`
    <style>
      @charset "UTF-8";
      * {
        font-size: 16px;
        font-family: "Montserrat", sans-serif;
        box-sizing: border-box;
      }

      .card {
        background-color: #fff;
        text-align: center;
        margin: auto;
        height: 480px;
        width: 320px;
        border-radius: 15px;
        box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.05);
      }

      .card .image,
      .card .refresh {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .card .image {
        position: relative;
        z-index: 0;
        background-color: #fef5d3;
        height: 300px;
        width: 320px;
        border-radius: 15px 15px 0 0;
      }

      .card .weather-icon {
        position: absolute;
        filter: invert();
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 130px;
        height: 130px;
      }

      .card .desc {
        position: absolute;
        color: white;
        left: 50%;
        bottom: 20px;
        transform: translate(-50%, 0);
        font-size: 17px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 20px;
        padding: 1px 9px;
      }

      .card .refresh {
        position: absolute;
        top: 10px;
        right: 12px;
        padding: 4px;
        cursor: pointer;
      }

      .card .content {
        height: 180px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .card .city {
        font-size: 17px;
        font-weight: 700;
        color: #d95720;
        letter-spacing: 5px;
        text-transform: uppercase;
      }

      .card .details {
        font-size: 13px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 2px;

        margin: 16px 0;
      }

      .card .temp {
        display: flex;
        justify-content: center;
        align-items: center;
        color: #d95720;
        font-weight: 600;
        height: 100%;
      }

      .card .temp span.current {
        font-size: 55px;
        position: relative;
      }

      .card .temp span.current::after {
        content: "°";
        position: absolute;
        top: -6px;
        right: -8px;
        font-size: 29px;
      }
    </style>
  `;

  template() {
    return html`
      ${this.style}

      <div class="card">
        <div
          class="image"
          style="
            background-image: linear-gradient(to top, rgba(240, 240, 240,
            0.4), rgba(217, 87, 32, 0.4)), url('${this.imageUrl}')
          "
        >
          <div
          class="weather-icon"
          style="background: url(${this.weatherIconUrl()}) center center">
          </div>

            <svg
              class="refresh"
              fill="#fff"
              @click=${this.refresh}
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="27px"
              height="27px"
              viewBox="0 0 487.23 487.23"
              style="enable-background:new 0 0 487.23 487.23;"
              xml:space="preserve"
            >
              <g>
                <g>
                  <path
                    d="M55.323,203.641c15.664,0,29.813-9.405,35.872-23.854c25.017-59.604,83.842-101.61,152.42-101.61
                c37.797,0,72.449,12.955,100.23,34.442l-21.775,3.371c-7.438,1.153-13.224,7.054-14.232,14.512
                c-1.01,7.454,3.008,14.686,9.867,17.768l119.746,53.872c5.249,2.357,11.33,1.904,16.168-1.205
                c4.83-3.114,7.764-8.458,7.796-14.208l0.621-131.943c0.042-7.506-4.851-14.144-12.024-16.332
                c-7.185-2.188-14.947,0.589-19.104,6.837l-16.505,24.805C370.398,26.778,310.1,0,243.615,0C142.806,0,56.133,61.562,19.167,149.06
                c-5.134,12.128-3.84,26.015,3.429,36.987C29.865,197.023,42.152,203.641,55.323,203.641z"
                  />
                  <path
                    d="M464.635,301.184c-7.27-10.977-19.558-17.594-32.728-17.594c-15.664,0-29.813,9.405-35.872,23.854
                c-25.018,59.604-83.843,101.61-152.42,101.61c-37.798,0-72.45-12.955-100.232-34.442l21.776-3.369
                c7.437-1.153,13.223-7.055,14.233-14.514c1.009-7.453-3.008-14.686-9.867-17.768L49.779,285.089
                c-5.25-2.356-11.33-1.905-16.169,1.205c-4.829,3.114-7.764,8.458-7.795,14.207l-0.622,131.943
                c-0.042,7.506,4.85,14.144,12.024,16.332c7.185,2.188,14.948-0.59,19.104-6.839l16.505-24.805
                c44.004,43.32,104.303,70.098,170.788,70.098c100.811,0,187.481-61.561,224.446-149.059
                C473.197,326.043,471.903,312.157,464.635,301.184z"
                  />
                </g>
              </g>
            </svg>

            <div class="desc">
              ${this.weather ? this.weather.desc : null}  
            </div>

          </div>

          <div class="content">
            <div class="city">${this.city}</div>

            ${
              this.datetime && this.weather
                ? html`
                    <div class="details">
                      ${this.datetime.day} | ${this.datetime.date} |
                      ${this.datetime.time}
                    </div>
                    <div class="temp">
                      <span class="current">${this.weather.temp}</span>
                    </div>
                  `
                : html`
                    <h2>Loading, please wait...</h2>
                  `
            }
          </div>
        </div>
      </div>
    `;
  }
}

window.customElements.define("weather-widget", WeatherWidget);
