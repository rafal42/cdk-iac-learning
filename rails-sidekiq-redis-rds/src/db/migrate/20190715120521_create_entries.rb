class CreateEntries < ActiveRecord::Migration[5.2]
  def change
    create_table :entries do |t|
      t.boolean :processed
      t.string :name

      t.timestamps
    end
  end
end
