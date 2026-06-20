describe('TC6 - Route Comparison Report', () => {

  it('Generates comparison report successfully', () => {

    cy.intercept('POST', '/api/compare')
      .as('compareRoute');

    cy.visit('http://127.0.0.1:8080');

    cy.get('#sourceSelect')
      .select('J4');

    cy.get('#targetSelect')
      .select('J7');

    cy.get('#compareBtn')
      .click();

    cy.wait('@compareRoute')
      .its('response.statusCode')
      .should('eq', 200);

    cy.get('#compareCard')
      .should('be.visible');

    cy.get('#compareContent')
      .should('not.be.empty');

    cy.get('#compareContent')
      .should('contain.text', 'Fastest Route');

    cy.get('#compareContent')
      .should('contain.text', 'Shortest Route');

  });

});