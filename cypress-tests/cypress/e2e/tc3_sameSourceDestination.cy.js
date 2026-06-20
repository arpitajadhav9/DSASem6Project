describe('TC3 - Same Source and Destination', () => {

  it('Handles same source and destination correctly', () => {

    cy.visit('http://127.0.0.1:8080');

    cy.get('#sourceSelect').select('J1');
    cy.get('#targetSelect').select('J1');

    cy.contains('button', 'Navigate').click();

    cy.get('#routeResultCard')
      .should('be.visible');

    cy.get('#routeSummary')
      .should('contain.text', '0 km');

    cy.get('#routeSummary')
      .should('contain.text', '0 min');

  });

});