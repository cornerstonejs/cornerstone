let $ = window.$;

export default {
  set $ (module) {
    $ = module;
  },
  get $ () {
    return $;
  }
};
