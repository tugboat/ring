BUILD_DIR = '/Users/bryanp/code/pakyow/apps/chat-example/public/pakyow-js'
BUILD_COMPONENT_DIR = File.join(BUILD_DIR, 'components')

def smash(source, dest)
  system("node_modules/.bin/smash #{source} > #{dest}")
end

task :reset do
  FileUtils.rm_rf(BUILD_DIR)
  FileUtils.mkdir(BUILD_DIR)
  FileUtils.mkdir(BUILD_COMPONENT_DIR)
end

task :build => [:reset] do
  smash('./src/pakyow.js', File.join(BUILD_DIR, 'pakyow.js'))

  # build components
  Dir.glob('./src/components/*.js').each do |path|
    smash(path, File.join(BUILD_COMPONENT_DIR, File.basename(path)))
  end

  # minify
  Dir.glob(File.join(BUILD_DIR, '**/*.js')).each do |path|
    filename = File.basename(path, File.extname(path))
    dest = File.join(File.dirname(path), "#{filename}.min.js")
    system("node_modules/.bin/uglifyjs #{path} > #{dest}")
  end
end

task :test do
  system("npm test")
end
