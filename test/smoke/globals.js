'use strict';

/* jshint browser:true */
/* globals expect:false */

describe('Custom UMD Build', function () {

  var OriginalFirebase, OriginalFirebaseSimpleLogin;
  beforeEach(function () {
    window.Firebase = OriginalFirebase = {};
    window.FirebaseSimpleLogin = OriginalFirebaseSimpleLogin = {};
  });

  it('exposes the full module as "mockfirebase"', function () {
    expect(window).to.have.property('mockfirebase').that.is.ok;
  });

  it('exposes "MockFirebase" on the window', function () {
    expect(window)
      .to.have.property('MockFirebase')
      .that.equals(window.mockfirebase.MockFirebase);
  });

  it('exposes "MockFirebaseSimpleLogin" on the window', function () {
    expect(window)
      .to.have.property('MockFirebaseSimpleLogin')
      .that.equals(window.mockfirebase.MockFirebaseSimpleLogin);
  });

  describe('#restore', function () {

    it('is a noop before #override is called', function () {
      window.MockFirebase.restore();
      expect(window)
        .to.have.property('Firebase')
        .that.equals(OriginalFirebase);
      expect(window)
        .to.have.property('FirebaseSimpleLogin')
        .that.equals(OriginalFirebaseSimpleLogin);
    });

    it('can restore Firebase', function () {
      window.MockFirebase.override();
      window.MockFirebase.restore();
      expect(window)
        .to.have.property('Firebase')
        .that.equals(OriginalFirebase);
      expect(window)
        .to.have.property('FirebaseSimpleLogin')
        .that.equals(OriginalFirebaseSimpleLogin);
    });

  });

  describe('#override', function () {

    it('can override Firebase', function () {
      window.MockFirebase.override();
      expect(window)
        .to.have.property('Firebase')
        .that.equals(window.mockfirebase.MockFirebase);
      expect(window)
        .to.have.property('FirebaseSimpleLogin')
        .that.equals(window.mockfirebase.MockFirebaseSimpleLogin);
    });

  });

});
