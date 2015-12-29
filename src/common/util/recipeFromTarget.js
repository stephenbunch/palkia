import Recipe from '../Recipe';
import arrayFromTarget from './arrayFromTarget';

/**
 * @param {Target} target
 * @returns {Recipe}
 */
export default function( target ) {
  target = arrayFromTarget( target );
  return new Recipe({
    create: target[ target.length - 1 ],
    ingredients: target.slice( 0, target.length - 1 )
  });
};
