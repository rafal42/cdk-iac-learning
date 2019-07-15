class EntryWorker
  include Sidekiq::Worker

  def perform
    Entry.where('created_at <= ?', DateTime.current).update_all(processed: true)
  end
end
