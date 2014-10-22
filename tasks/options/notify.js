/*global module:false*/
module.exports = {
  default: {
    options: {
      title: "<%= package.title || package.name %>"
    }
  },
  dev: {
    options: {
      title: "<%= package.title || package.name %>",
      message: "Dev files ready"
    }
  },
  jade: {
    options: {
      title: "<%= package.title || package.name %>",
      message: "Jade files compiled"
    }
  },
  js: {
    options: {
      title: "<%= package.title || package.name %>",
      message: "Javascript files compiled"
    }
  },
  medias: {
    options: {
      title: "<%= package.title || package.name %>",
      message: "Medias copied"
    }
  },
  release: {
    options: {
      title: "<%= package.title || package.name %>",
      message: "Release complete"
    }
  },
  sass: {
    options: {
      title: "<%= package.title || package.name %>",
      message: "Sass files compiled"
    }
  },
  sprite: {
    options: {
      title: "<%= package.title || package.name %>",
      message: "Sprites done"
    }
  }
};
