describe('FeedJett | Options |', function() {
  var rootdir = __dirname + '/../../../';
  var FeedJett =  require(rootdir + 'lib/feedjett.js');
  var rssDir = rootdir + 'test/feeds/rss/';

  it('should set default options', function () {
    var feedJett = new FeedJett();
    var options = feedJett.options;

    expect(options.strict).to.be.false;
    expect(options.normalize).to.be.true;
    expect(options.addMeta).to.be.true;
    expect(options.resumeOnSaxError).to.be.true;
    expect(options.MAX_BUFFER_LENGTH).to.equal(16 * 1024 * 1024);
    expect(options.parseMeta).to.be.true;
    expect(options.parseRawNode).to.be.false;
    expect(feedJett.enabledProps.meta.length).to.equal(15);
    expect(feedJett.enabledProps.item.length).to.equal(15);
  });

  it('should change default options', function () {
    var feedJett = new FeedJett({
      strict: true,
      normalize: false,
      addMeta: false,
      resumeOnSaxError: false,
      MAX_BUFFER_LENGTH: 20000,
      parseMeta: false,
      parseRawNode: true
    });
    var options = feedJett.options;

    expect(options.strict).to.be.true;
    expect(options.normalize).to.be.false;
    expect(options.addMeta).to.be.false;
    expect(options.resumeOnSaxError).to.be.false;
    expect(options.MAX_BUFFER_LENGTH).to.equal(20000);
    expect(options.parseMeta).to.be.false;
    expect(feedJett.enabledProps).to.be.undefined;
    expect(options.parseMeta).to.be.false;
    expect(options.parseRawNode).to.be.true;
  });

  it('should whiteList/enable specific properties and hold precedence over blacklist', function () {
    var feedJett = new FeedJett({
      whiteList: ['title', 'description', 'link', 'pubDate']
    });

    expect(feedJett.enabledProps.item).to.have.length(4);
    expect(feedJett.enabledProps.meta).to.have.length(4);
    expect(feedJett.enabledProps.item).to.have.deep.property('[0]', 'title');
    expect(feedJett.enabledProps.item).to.have.deep.property('[1]', 'description');
    expect(feedJett.enabledProps.meta).to.have.deep.property('[0]', 'title');
    expect(feedJett.enabledProps.meta).to.have.deep.property('[1]', 'description');
  });

  it('should blackList/disable specific properties', function () {
    var feedJett = new FeedJett({
      blackList: ['title', 'description', 'link', 'pubDate', 'xmlUrl', 'origLink']
    });

    expect(feedJett.enabledProps.item).to.have.length(10);
    expect(feedJett.enabledProps.meta).to.have.length(10);
    expect(feedJett.enabledProps.item).to.have.deep.property('[0]', 'updatedDate');
    expect(feedJett.enabledProps.item).to.have.deep.property('[1]', 'categories');
    expect(feedJett.enabledProps.meta).to.have.deep.property('[0]', 'updatedDate');
    expect(feedJett.enabledProps.meta).to.have.deep.property('[1]', 'categories');
  });

  it('should add a custom parser for items to FeedJett', function () {
    FeedJett.addCustomParser('custom', 'item', 'parseCustom', function (node, nodeType, feedType) {});
    var feedJett = new FeedJett();

    expect(feedJett.enabledProps.meta).to.have.length(15);
    expect(feedJett.enabledProps.item).to.have.length(16);
    expect(feedJett.enabledProps.item).to.have.deep.property('[15]', 'custom');
  });

  describe('Overridden Parsers |', function() {
    var items = [];

    before(function(done) {
      var test = function () {return 'testCustomParsers';};

      var options = {
        parseTitle: test,
        parseDescription: test,
        parseLink: test,
        parseUpdatedDate: test,
        parsePubDate: test,
        parseCategories: test,
        parseAuthor: test,
        parseImage: test,
        parseXmlUrl: test,
        parseOrigLink: test,
        parseLanguage: test,
        parseIcon: test,
        parseCopyright: test,
        parseGenerator: test,
        parseCloud: test,
        parseComments: test,
        parseCommentRss: test,
        parseUpdateInfo: test,
        parseEnclosures: test,
        parseGuid: test,
        parseSource: test,
        parseContent: test
      };

      var feedJett = new FeedJett(options)
        .on('meta', function (result) {
        }).on('readable', function () {
          items.push(this.read());
        }).on('end', function () {
          done();
        });

      fs.createReadStream(rssDir + 'rss.1.xml').pipe(feedJett);
    });

    it('should use custom parse function for all normalized props', function () {
      var normalizedProps = {
        meta: ['title','description','link','pubDate','updatedDate','categories','author','image','xmlUrl','language','icon','copyright','generator','updateInfo','cloud'],
        item: ['title','description','link','pubDate','updatedDate','categories','author','image','content','guid','origLink','comments','commentRss','enclosures','source']
      };

      var item = items[0];
      normalizedProps.item.forEach(function (prop) {
        expect(item[prop]).to.equal('testCustomParsers');
      });

      normalizedProps.meta.forEach(function (prop) {
        expect(item.meta[prop]).to.equal('testCustomParsers');
      });
    });

  });

});