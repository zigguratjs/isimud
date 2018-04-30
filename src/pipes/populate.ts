import {Pipe, Execution, step} from '@ziggurat/ningal';
import {Collection} from '../interfaces';
import {Document} from '../models/document';
import {Component, PipeFunction, callable} from '@ziggurat/ningal';

export class PopulatePipe extends Component<object, Document[]> {
  @step('cache') private cache: PipeFunction<Document>;
  @step('validate') private validate: PipeFunction<Document>;

  public constructor(
    private name: string,
    private source: Collection,
    private buffer: Collection,
    cachePipe: Pipe<any>,
    validationPipe: Pipe<any>
  ) {
    super();
    this.cache = callable(cachePipe);
    this.validate = callable(validationPipe);
  }

  public async process(selector: object, exec: Execution<any>): Promise<Document[]> {
    let docs: Document[] = [];
    for (let doc of await this.populateBuffer(await this.source.find(), exec)) {
      try {
        docs.push(await this.cache(doc, exec));
      } catch (err) {
        this.emit('document-error', err);
      }
    }
    return docs;
  }

  private async populateBuffer(docs: Document[], exec: Execution<any>): Promise<Document[]> {
    for (let doc of docs) {
      doc._collection = this.name;
      try {
        await this.buffer.upsert(await this.validate(doc, exec));
      } catch (err) {
        this.emit('document-error', err);
      }
    }
    return this.buffer.find();
  }
}