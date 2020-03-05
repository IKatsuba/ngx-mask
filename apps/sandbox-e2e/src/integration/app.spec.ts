import { getInput } from '../support/app.po';

describe('sandbox', () => {
  beforeEach(() => cy.visit('/'));

  it('should display input', () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    getInput().should('have.value', '+7 (123) ');
  });
});
