import { FilterQuery } from 'mongoose';

export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'regex'
  | 'exists';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export class QueryFilterBuilder<T> {
  private filters: FilterCondition[] = [];

  /**
   * Add a filter condition
   */
  where(field: string, operator: FilterOperator, value: unknown): this {
    this.filters.push({ field, operator, value });
    return this;
  }

  /**
   * Add equals filter
   */
  equals(field: string, value: unknown): this {
    return this.where(field, 'eq', value);
  }

  /**
   * Add not equals filter
   */
  notEquals(field: string, value: unknown): this {
    return this.where(field, 'ne', value);
  }

  /**
   * Add greater than filter
   */
  greaterThan(field: string, value: number | Date): this {
    return this.where(field, 'gt', value);
  }

  /**
   * Add greater than or equals filter
   */
  greaterThanOrEquals(field: string, value: number | Date): this {
    return this.where(field, 'gte', value);
  }

  /**
   * Add less than filter
   */
  lessThan(field: string, value: number | Date): this {
    return this.where(field, 'lt', value);
  }

  /**
   * Add less than or equals filter
   */
  lessThanOrEquals(field: string, value: number | Date): this {
    return this.where(field, 'lte', value);
  }

  /**
   * Add in array filter
   */
  in(field: string, values: unknown[]): this {
    return this.where(field, 'in', values);
  }

  /**
   * Add not in array filter
   */
  notIn(field: string, values: unknown[]): this {
    return this.where(field, 'nin', values);
  }

  /**
   * Add regex filter (case-insensitive search)
   */
  search(field: string, searchTerm: string): this {
    return this.where(field, 'regex', searchTerm);
  }

  /**
   * Add exists filter
   */
  exists(field: string, exists: boolean = true): this {
    return this.where(field, 'exists', exists);
  }

  /**
   * Build MongoDB filter query
   */
  build(): FilterQuery<T> {
    const query: Record<string, unknown> = {};

    for (const filter of this.filters) {
      const { field, operator, value } = filter;

      switch (operator) {
        case 'eq':
          query[field] = value;
          break;
        case 'ne':
          query[field] = { $ne: value };
          break;
        case 'gt':
          query[field] = { $gt: value };
          break;
        case 'gte':
          query[field] = { $gte: value };
          break;
        case 'lt':
          query[field] = { $lt: value };
          break;
        case 'lte':
          query[field] = { $lte: value };
          break;
        case 'in':
          query[field] = { $in: value };
          break;
        case 'nin':
          query[field] = { $nin: value };
          break;
        case 'regex':
          query[field] = {
            $regex: value,
            $options: 'i',
          };
          break;
        case 'exists':
          query[field] = { $exists: value };
          break;
      }
    }

    return query as FilterQuery<T>;
  }

  /**
   * Reset all filters
   */
  reset(): this {
    this.filters = [];
    return this;
  }
}

/**
 * Create a new query filter builder
 */
export function createFilterBuilder<T>(): QueryFilterBuilder<T> {
  return new QueryFilterBuilder<T>();
}
