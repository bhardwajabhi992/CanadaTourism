class ThemeSwitcher extends React.Component {
  constructor() {
    let cachedTheme = localStorage.getItem("theme");
    if (cachedTheme == undefined) {
      cachedTheme = "light";
    }

    super();
    this.state = {
      theme: cachedTheme,
    };
  }

  componentDidMount() {
    this.handleThemeChange({
      target: {
        id: this.state.theme == "light" ? "light-btn" : "dark-btn",
      },
    });
  }

  handleThemeChange = (e) => {
    localStorage.setItem(
      "theme",
      e.target.id == "light-btn" ? "light" : "dark"
    );
    document
      .getElementById("theme-css")
      .setAttribute(
        "href",
        e.target.id == "light-btn" ? "css/style.css" : "css/dark.css"
      );
    this.setState({
      theme: e.target.id == "light-btn" ? "light" : "dark",
    });
  };
  render() {
    return (
      <div className="btn-group btn-group-toggle" data-toggle="buttons">
        <form>
          <button
            type="button"
            id="light-btn"
            className={
              this.state.theme == "light"
                ? "btn primary-color btn-sm"
                : "btn btn-light btn-sm"
            }
            onClick={this.handleThemeChange}
          >
            Light
          </button>
          <button
            id="dark-btn"
            type="button"
            className={
              this.state.theme == "dark"
                ? "btn primary-color btn-sm"
                : "btn btn-light btn-sm"
            }
            onClick={this.handleThemeChange}
          >
            Dark
          </button>
        </form>
      </div>
    );
  }
}

ReactDOM.render(<ThemeSwitcher />, document.getElementById("theme"));
