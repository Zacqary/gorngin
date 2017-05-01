define([
  'services/dialogue/dialogueHelpers',
  'services/dialogue/dialogueSvc'
], function(dialogueHelpers, dialogueSvc) {
  describe('dialogueHelpers', function() {

    describe('splitBody', function() {
        var body = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
                   'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' +
                   'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' +
                   ' Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' +
                   'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
        it('should split long string into an array of shorter strings', function() {
          var test = dialogueHelpers.splitBody(body, {});
          expect(test).toEqual(jasmine.any(Array));
          expect(test.length).toBeGreaterThan(0);
        });
    });


  });

});
