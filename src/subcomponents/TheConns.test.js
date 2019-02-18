import TheConns from './TheConns.vue';
// Some extra, global variables are defined in 'test-setup.js'.


describe('sub/TheConns', () => {

  var w;  // Each test will assign its created TheConns component to this var.

  const sizes = {
    theConnsMarginBottom: 2,
    theConnsMinLevels: 3,
    theConnsLevelHeight: 19
  };

  const make = props => {
    w = mount(TheConns, {
      propsData: Object.assign(
        { origConns: [],
          width: 400,
          sizes,
          termsChangeNr: 1
        },
        props,
        { sizes: Object.assign({}, sizes, props.sizes) }
      ),
      ///parentComponent: {$refs: {theTerms: {bkgrColor: '#fff'}}} // (Unneeded).
    });
  };


  it('initializes, when getting only the required props', () => {
    make({ });
    w.isVueInstance().should.equal(true);
  });
});
