export * from './createProp';
export * from './propsRegistry';
export * from './createFilePropList';
export * from './writeProps';
export * from './getComponents';
export * from './componentsAvailable';

import writeRegisteredPropsFactory from './writeRegisteredProps';
import { propsRegistry } from './propsRegistry';

export const writeRegisteredProps = writeRegisteredPropsFactory({
  propsRegistry
});