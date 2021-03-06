# react-infinite-pane

> Responsive infinite scroll pane for React

### Demo: https://react-infinite-scroll.herokuapp.com/

## Features

* Supports a static scroll bar so the height of the window should always be equal to what it would be if all items were loaded.
* ONLY items in the view get loaded, all other items above and below
the fold aren't actually in the DOM.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i react-infinite-pane --save-dev
```

## Usage

```js
<InfinitePane
  Component={MyComponent} // The component to pass props to
  componentProps={{ width: 10 }} // Static props to pass the component
  list={data} // A list of objects to be passed as props to [Component]
  totalCount={imageCount} // Required to determine scrollbar height
  fetch={({ startIndex, endIndex }) => { /* ... */ }} // the function to call to load more (if not preloaded).
/>
```

### The `loaded` prop

`this.props.loaded` will only return true if the item is in the index. Otherwise it will return a copy of the first item in the index. Use this to build logic into your component to display a loading graphic/message.


## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Todo

- [ ] Tests. **Status: Currently the scroll state is difficult to test with JSDOM. Looking into using an actual browser environment to test.

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jwaldrip/react-infinite-pane/issues)

## Author

**Jason Waldrip**

* [github/jwaldrip](https://github.com/jwaldrip)
* [twitter/jwaldrip](http://twitter.com/jwaldrip)

## License

Copyright © 2016 [Jason Waldrip](mailto:jason@waldrip.net)
Licensed under the MIT license.
