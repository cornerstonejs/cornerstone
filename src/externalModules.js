let $ = window.$;

const external = {
  set $ (module) {
    $ = module;
  },
  get $ () {
    return $;
  }
};

export { external };
