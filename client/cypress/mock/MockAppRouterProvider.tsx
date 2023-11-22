/// <reference  types="cypress" />
import {
  AppRouterContext,
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';

const createRouter = (params: Partial<AppRouterInstance>) => ({
  push: cy.stub().as('push'),
  replace: cy.stub().as('replace'),
  refresh: cy.stub().as('refresh'),
  prefetch: cy.stub().as('prefetch').resolves(),
  back: cy.stub().as('back'),
  forward: cy.stub().as('forward'),
  ...params,
});

interface AppRouterContextProps extends Partial<AppRouterInstance> {
  children: React.ReactNode;
}
function MockAppRouterProvider({ children, ...props }: AppRouterContextProps) {
  const router = createRouter(props);
  return (
    <AppRouterContext.Provider value={router}>
      {children}
    </AppRouterContext.Provider>
  );
}

export default MockAppRouterProvider;
