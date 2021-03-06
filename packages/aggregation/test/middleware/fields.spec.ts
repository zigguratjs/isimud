import {Pipe} from '@ziqquratu/pipe';
import {SetPipeFactory, UnsetPipeFactory} from '../../src/middleware/fields';
import {expect} from 'chai';
import 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Collection, Database } from '@ziqquratu/database';

chai.use(chaiAsPromised);

describe('fields', () => {
  describe('SetPipeFactory', () => {
    const fact = new SetPipeFactory({
      name: {$concat: ['$givenName', ' ', '$familyName']},
    });
    let pipe: Pipe;

    before(async () => {
      pipe = await fact.create({} as Collection, {} as Database);
    });

    it('should add provided fields', async () => {
      return expect(pipe({givenName: 'John', familyName: 'Doe'}))
        .to.eventually.eql({givenName: 'John', familyName: 'Doe', name: 'John Doe'});
    });
    it('should override existing fields', async () => {
      return expect(pipe({givenName: 'John', familyName: 'Doe', name: 'existing'}))
        .to.eventually.eql({givenName: 'John', familyName: 'Doe', name: 'John Doe'});
    });
    it('should not mutate input document', async () => {
      const doc = {givenName: 'John', familyName: 'Doe'};
      await pipe(doc);
      return expect(doc).to.eql({givenName: 'John', familyName: 'Doe'});
    });

    describe('nested fields', () => {
      const fact = new SetPipeFactory({
        'specs.fuelType': 'unleaded'
      });
      let pipe: Pipe;

      before(async () => {
        pipe = await fact.create({} as Collection, {} as Database);
      });

      it('should add provided fields', async () => {
        return expect(pipe({type: 'car', specs: {doors: 4, wheels: 4}}))
          .to.eventually.eql({type: 'car', specs: {doors: 4, wheels: 4, fuelType: 'unleaded'}});
      });
    });
  });

  describe('UnsetPipeFactory', () => {
    const fact = new UnsetPipeFactory(['name']);
    let pipe: Pipe;

    before(async () => {
      pipe = await fact.create({} as Collection, {} as Database);
    });

    it('should unset provided fields', async () => {
      return expect(pipe({givenName: 'John', familyName: 'Doe', name: 'John Doe'}))
        .to.eventually.eql({givenName: 'John', familyName: 'Doe'});
    });
    it('should ignore missing fields', async () => {
      return expect(pipe({givenName: 'John', familyName: 'Doe'}))
        .to.eventually.eql({givenName: 'John', familyName: 'Doe'});
    });
    it('should not mutate input document', async () => {
      const doc = {givenName: 'John', familyName: 'Doe', name: 'John Doe'};
      await pipe(doc);
      return expect(doc).to.eql({givenName: 'John', familyName: 'Doe', name: 'John Doe'});
    });

    describe('nested fields', () => {
      const fact = new UnsetPipeFactory(['specs.fuelType']);
      let pipe: Pipe;

      before(async () => {
        pipe = await fact.create({} as Collection, {} as Database);
      });

      it('should unset provided fields', async () => {
        return expect(pipe({type: 'car', specs: {doors: 4, wheels: 4, fuelType: 'unleaded'}}))
          .to.eventually.eql({type: 'car', specs: {doors: 4, wheels: 4}});
      });
    });
  });
});
