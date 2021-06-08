import React, { Component } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import md_file_path from "./repos_licence.md";

class Markdown_test extends Component {
  constructor(props) {
    super(props);

    this.state = { md_file: null };
  }

  componentWillMount() {
    fetch(md_file_path)
      .then((response) => response.text())
      .then((text) => {
        this.setState({ md_file: text });
      });
  }

  render() {
    return (
      <div className="outer">
        <div className="markdown">
          <ReactMarkdown remarkPlugins={[gfm]} children={this.state.md_file} />
        </div>
      </div>
    );
  }
}

export default Markdown_test;
