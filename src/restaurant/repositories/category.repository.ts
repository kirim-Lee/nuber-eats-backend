import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/\s/g, '-');
    const category = await this.findOne({ slug: categorySlug });

    if (!category) {
      return await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }

    return category;
  }
}
