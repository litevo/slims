<?php
# @Author: Waris Agung Widodo <user>
# @Date:   2018-01-23T11:26:05+07:00
# @Email:  ido.alit@gmail.com
# @Filename: footer.php
# @Last modified by:   user
# @Last modified time: 2018-01-23T11:26:47+07:00
?>


<footer class="py-4 bg-grey-darkest text-grey-lighter">
    <div class="container">
        <div class="row py-4">
            <div class="col-md-3">
              <?php
              if(isset($sysconf['logo_image']) && $sysconf['logo_image'] != '' && $imagesDisk->isExists($path = 'default/'.$sysconf['logo_image'])){
                echo '<img class="h-10 w-15" src="'.SWB . 'lib/minigalnano/createthumb.php?filename=images/' . $path.'&width=350">';
              }
              elseif (file_exists(__DIR__ . '/../assets/images/logo.png')) {
                echo '<img class="h-12 w-12 mb-2" src="' . assets(v('images/logo.png')) . '">';
              } else {
                ?>
                  <svg
                          class="fill-current text-grey-lighter block h-12 w-12 mb-2"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                          viewBox="0 0 118.4 135" style="enable-background:new 0 0 118.4 135;"
                          xml:space="preserve">
                </svg>
              <?php } ?>
                <div class="mb-4"><?php echo $sysconf['library_name']; ?></div>
                <ul class="list-reset">
                    <li><a class="text-light" href=""></a></li>
                </ul>
            </div>
            <div class="col-md-5 pt-8 md:pt-0">
                <h4 class="mb-4"><?= __('About Us'); ?></h4>
                <p>
                    <?= $sysconf['template']['classic_footer_about_us']; ?>
                </p>
            </div>
            <div class="col-md-4 pt-8 md:pt-0">
                <h4 class="mb-4"><?= __('Search'); ?></h4>
                <div class="mb-2"><?= __('start it by typing one or more keywords for title, author or subject'); ?></div>
                <form action="index.php">
                    <input type="hidden" ref="csrf_token" value="<?= $_SESSION['csrf_token']??'' ?>">
                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token']??'' ?>">
                    <div class="input-group mb-3">
                        <input name="keywords" type="text" class="form-control"
                               placeholder="<?= __('Enter keywords'); ?>"
                               aria-label="Enter keywords"
                               aria-describedby="button-addon2">
                        <div class="input-group-append">
                            <button class="btn btn-primary" type="submit" value="search" name="search"
                                    id="button-addon2"><?= __('Find Collection'); ?>
                            </button>
                        </div>
                    </div>
                </form>
                <hr>
            </div>
        </div>
        <hr>
        <div class="flex font-thin text-sm">
            <p class="flex-1">&copy; <?php echo date('Y'); ?>  </p>
            <div class="flex-1 text-right text-grey"><?php ?><code></code></div>
        </div>
    </div>
</footer>

<?php if ($sysconf['chat_system']['enabled'] && $sysconf['chat_system']['opac']) : ?>
    <div id="show-pchat2" style="position: fixed; bottom: 16px; right: 16px" class="shadow rounded">
        <button title="Chat" class="btn btn-primary"><i class="fas fa-comments mr-2"></i><?= __('Chat'); ?></button>
    </div>
<?php endif; ?>

<?php
// Chat Engine
include LIB . "contents/chat.php"; ?>

<!-- // Load modal -->
<?php include "_modal_topic.php"; ?>
<?php include "_modal_advanced.php"; ?>
<?php include "_modal_social_media.php"; ?>

<!-- // Load highlight -->
<script src="<?= JWB; ?>highlight.js"></script>
<?php if(isset($engine) && $searchableInJsArray = $this->generateKeywords($engine->searchable_fields)) : ?>
<script>
  $('.card-body > *').highlight(<?= $searchableInJsArray ?>);
</script>
<?php endif; ?>

<!-- // load our vue app.js -->
<script src="<?php echo assets(v('js/app.js')); ?>"></script>
<script src="<?php echo assets(v('js/app_jquery.js')); ?>"></script>
<?php include __DIR__ . "/../assets/js/vegas.js.php"; ?>
<?php if ($sysconf['chat_system']['enabled'] && $sysconf['chat_system']['opac']) : ?>
    <script>
        $('#show-pchat').click(() => {
            $('.s-chat').hide()
            $('#show-pchat2').show()
        })
        $('#show-pchat2').click(() => {
            $('.s-chat').show(300, () => {
                $('#show-pchat2').hide()
            })
        })
    </script>
<?php endif; ?>
</body>
</html>
